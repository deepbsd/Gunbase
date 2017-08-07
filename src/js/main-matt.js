(function($) {

  var app = {
    buildAddAGunTemplate: function() {
      $("#navaddgun").click(function(){
        var template = '<div class="formWrap"><h3>Add A Gun</h3><form id="addagun_form">';
        template += '<input id="manufacturer" type="text" placeholder="manufacturer" name="manufacturer">';
        template += '<input id="model"  type="text" placeholder="model" name="model">';
        template += '<input id="chambering"  type="text" placeholder="chambering" name="chambering">';
        template += '<input id="type" type="text" placeholder="type" name="type">';
        template += '<input  id="serial_number" type="text" placeholder="serial_number" name="serial_number">';
        template += '<input id="image" type="text" placeholder="image" name="image">'
        template += '<input id="value" type="text" placeholder="value" name="value">';
        template += '<input id="sold" type="text" placeholder="sold" name="sold">';
        template += '<input id="buyer" type="text" placeholder="buyer" name="buyer">';
        template += '<br><div class="btn_wrapper"><button type="submit">Submit</button></div>';
        template += '</form></div>';
        $("#output").html(template);
      });
    },
    createGun: function() {
      $(document).on("submit", "#addagun_form", function(e){
        e.preventDefault();
        let gunObj = {
          manufacturer: $("#manufacturer").val(),
          model: $("#model").val(),
          chambering: $("#chambering").val(),
          type: $("#type").val(),
          serial_number: $("#serial_number").val(),
          image: $("#image").val(),
          value: $("#value").val(),
          sold: $("#sold").val(),
          buyer: $("#buyer").val()
        }
        gunObj.image = `img/${gunObj.image}`;
        app.postNewGun(gunObj);
      })
    },
    filterSearch: function() {
      $(document).on('input', "#top-form-find", function(){
        let criteria = $("#top-find").val();
        app.loadFindData(criteria);
      });
    },
    getAllGuns: function() {
      return new Promise(function (res, rej) {
        $.ajax({
          crossOrigin: true,
          url: app.rootURL,
          type: "GET",
          headers: {
            "accept": "application/jsonp;odata=verbose",
          },
          success: function(gundata) {
            var num=0;
            gundata.forEach( gun => {
              //state.guns[gun.fullName] = gun;
              state.guns[num] = gun;
              num++;
            });
            console.log('StateObject: ',state.guns);
            res(state);
          },
          error: function(error){
            console.log('getAllGuns() error: ',error);
            rej('There was an error: ',error);
          }
        })
      })
    },
    getIcon: function(type) {
      switch (type){
        case 'pistol':
          return '1911.png';
        case 'revolver':
          return 'revolver.png';
        case 'rifle':
          return 'rifle1.png';
        case 'shotgun':
          return 'shotgun.png';
        default:
          return 'glock.png';
      }
    },
    getOneGun: function(gunId) {
      alert(gunId);
    },
    init: function() {
      app.getAllGuns().then(app.outputGunsReport);
      app.filterSearch();
      app.singleEntryListener();
      app.buildAddAGunTemplate();
      app.createGun();
    },
    loadFindData: function(criteria) {
      if (!criteria){
        $("#list-top").empty();
        state.guns.forEach((gun, index, array) => {
          let gunicon = app.getIcon(gun.type);
          $("#list-top").append(`<li class="cf"><div class="vcenter"><div class="itemdata centered" data-gunobj="${gun.id}"><div class="nimg"><img src="icons/${gunicon}" alt="Gun icon"/></div></div><div class="itemdata" data-gunobj="${gun.id}">${gun.manufacturer}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.model}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.chambering}</div></div></li>`);
        })
      } else {
        let selections = state.guns.filter( gun => {
          return gun.manufacturer.toLowerCase().includes(criteria.toLowerCase());
        });
        $("#list-top").empty();
        selections.forEach((gun, index, array) => {
          let gunicon = app.getIcon(gun.type);
          $("#list-top").append(`<li class="cf"><div class="vcenter"><div class="itemdata centered" data-gunobj="${gun.id}"><div class="nimg"><img src="icons/${gunicon}" alt="Gun icon"/></div></div><div class="itemdata" data-gunobj="${gun.id}">${gun.manufacturer}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.model}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.chambering}</div></div></li>`);
        });
      }
    },
    outputGunsReport: function() {
      var template = '<form class="centered" id="top-form-find"><input type="text" id="top-find" placeholder="Search for manufacturers" /></form>';
          template += '<ul class="list-one" id="list-top">';
      state.guns.forEach( gun => {
        let gunicon = app.getIcon(gun.type)
        template += `<li class="cf"><div class="vcenter"><div class="itemdata centered" data-gunobj="${gun.id}"><div class="nimg"><img src="icons/${gunicon}" data-gunobj="${gun.id}" alt="Gun icon"/></div></div><div class="itemdata" data-gunobj="${gun.id}">${gun.manufacturer}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.model}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.chambering}</div></div></li>`;
      })
      template += '</ul>';
      $("#output").html(template);
    },
    postNewGun: function(gunData) {
        $.ajax({
          url: app.rootURL,
          type: "POST",
          headers: {
            "accept": "application/json;odata=verbose",
          },
          data: JSON.stringify(gunData),
          contentType: "application/json; charset=utf-8",
          dataType: 'json',
          success: function(gundata) {
            app.getAllGuns()
            .then(app.outputGunsReport);
          },
          error: function(error){
            console.log('error: ',error);
          }
        })
    },
    singleEntryListener: function() {
      $(document).on("click", ".itemdata", function(ev){
        var targetId = $(ev.target).data('gunobj');
        app.getOneGun(targetId);
      })
    },
    rootURL: 'http://localhost:8080/guns'

  };

  const state = {
    guns: []
  }

  $(document).ready(function() {
    app.init();
  })
})(window.jQuery)
