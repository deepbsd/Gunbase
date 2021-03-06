
(function($) {

  var app = {
    buildAddAGunTemplate: function() {
      $("#navaddgun").click(function(){
        app.disableOverlay();
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
        app.disableOverlay();
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
    createSummaryPg: function(){
      app.disableOverlay();
      var pistols, revolvers, rifles, shotguns, others, totalguns, value;
      pistols = revolvers = rifles = shotguns = others = totalguns = value = 0;
      state.guns.forEach( gun => {
        switch (gun.type) {
          case 'revolver':
          revolvers += 1;
          break;
        case 'rifle':
          rifles += 1;
          break;
        case 'pistol':
          pistols += 1;
          break;
        case 'shotgun':
          shotguns += 1;
          break;
        default:
          others += 1;
        }
        value += gun.value
      })
      totalguns = state.guns.length;
      template = `<h2>Summary</h2>
      <div class="summaryWrap">
        <div class="stats">
          <h6>Pistols</h6>
          <div>${pistols}</div>
        </div>
        <div class="stats">
          <h6>Revolvers</h6>
          <div>${revolvers}</div>
        </div>
        <div class="stats">
          <h6>Rifles</h6>
          <div>${rifles}</div>
        </div>
        <div class="stats">
          <h6>Shotguns</h6>
          <div>${shotguns}</div>
        </div>
        <div class="stats">
          <h6>Others</h6>
          <div>${others}</div>
        </div>
        <div class="stats">
          <h6>Total Guns</h6>
          <div>${totalguns}</div>
        </div>
        <div class="stats">
          <h6>Value</h6>
          <div>${value.toLocaleString("en-US", {style:"currency", currency:"USD"})}</div>
        </div>
      </div>`;
      $("#output").html(template);
    },
    deleteGun: function(gunId){
      return new Promise(function (res, rej) {
        var myURL = app.rootURL + '/' + gunId;
        $.ajax({
          url: myURL,
          type: 'DELETE',
          headers: {
            "accept": "application/json;odata=verbose",
          },
          contentType: "application/json; charset=utf-8",
          dataType: 'json',
          success: function() {
            console.log(`Gun ${gunId} deleted!`);
            res();
          },
          error: function(error){
            rej('There was an error deleting the gun: ',error);
            console.log('Update failed.  Error: ',error);
          }
        })
      })
    },
    deleteProxy: function(gunId) {
      app.deleteGun(gunId)
      .then(app.getAllGuns)
      .then(app.outputGunsReport)
    },
    disableOverlay: function(){
      $("html").removeClass("disable");
      $("#t-navitems").removeClass("active");
      $("#t-overlay").removeClass("active");
      $("#t-mobileicon").removeClass("active");
    },
    filterSearch: function() {
      $(document).on('input', "#top-form-find", function(){
        let criteria = $("#top-find").val();
        app.loadFindData(criteria);
      });
    },
    formatMoney: function(num, c, d, t){
      var n = num,
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "." : d,
      t = t == undefined ? "," : t,
      s = n < 0 ? "-" : "",
      i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
      j = (j = i.length) > 3 ? j % 3 : 0;
      console.log('$' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : ""));
      return '$' + s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
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
            state.guns = [];  // reset state before db call
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
      var myURL = app.rootURL + '/' + gunId;
      $.ajax({
        url: myURL,
        type: 'GET',
        headers: {
          "accept": "application/json;odata=verbose",
        },
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function(gundata) {
          console.log('HEY!  Object: ',gundata);
          var template = '<div id="update_gun_function"><form id="update_gun_form">';
          template += `<img class="medium-img"  src="${gundata.image}"/>`;
          template += `<div class="fieldWrapWrapper"><div class="basicFieldWrap">`
          template += `<label for="manufacturer">Manufacturer</label>`;
          template += `<input id="manufacturer" type="text" placeholder="${gundata.manufacturer}" name="manufacturer" value="${gundata.manufacturer}">`;
          template += `<label for="model">Model</label>`;
          template += `<input id="model"  type="text" placeholder="${gundata.model}" name="model" value="${gundata.model}">`;
          template += `<label for="chambering">Chambering</label>`;
          template += `<input id="chambering"  type="text" placeholder="${gundata.chambering}" name="chambering" value="${gundata.chambering}">`;
          template += `<label for="type">Type</label>`;
          template += `<input id="type" type="text" placeholder="${gundata.type}" name="type" value="${gundata.type}">`;
          template += `<label for="serial_number">Serial Number</label>`;
          template += `<input  id="serial_number" type="text" placeholder="${gundata.serial_number}" name="serial_number" value="${gundata.serial_number}">`;
          template += `</div><div class="basicFieldWrap">`
          template += `<label for="image">Image</label>`;
          template += `<input id="image" type="text" placeholder="${app.imgPath(gundata.image)}" name="image" value="${app.imgPath(gundata.image)}">`;
          template += `<label for="value">Dollar Value</label>`;
          template += `<input id="value" type="text" placeholder="${gundata.value}" name="value" value="${gundata.value}">`;
          template += `<label for="sold">Sold</label>`;
          template += `<input id="sold" type="text" placeholder="${gundata.sold}" name="sold" value="${gundata.sold}">`;
          template += `<label for="buyer">Buyer</label>`;
          template += `<input id="buyer" type="text" placeholder="${gundata.buyer}" name="buyer" value="${gundata.buyer}">`;
          template += '<div class="btn_wrapper"><button type="submit" id="update_gun_submit">Update</submit> ';
          template += '<button type="submit" id="delete_gun_submit">Delete</div></submit>';
          template += `</div></div>`;  //end of second basicFieldWrap and fieldWrapWrapper
          template += '</form></div>';
          $("#output").html(template);
          //Update_gun listener
          $("#update_gun_submit").click(function(ev){
            ev.preventDefault();
            let fields = ['manufacturer', 'model', 'chambering', 'type', 'serial_number', 'image', 'value', 'sold', 'buyer'];
            let updateData = {};
            updateData.id = `${gunId}`;
            fields.forEach(function(field){
              if ($('#'+field).val()) {
                let thevalue = $('#'+field).val();
                if (field == 'image'){
                  updateData[field] = `img/${thevalue}`;
                } else {
                  updateData[field] = `${thevalue}`;
                }
              }
            })
            console.log('TYPEOF:  ',typeof updateData, ' DATA: ',updateData);
            app.updateGun(updateData, gunId);
          })
          // delete gun listener
          $("#delete_gun_submit").click(function(ev){
            ev.preventDefault();
            console.log('Deleting gun with id: ', gunId);
            app.deleteProxy(gunId);
            // app.outputGunsReport();
          })
        },
        error: function(error){
          console.log('error *getting* the record: ',error);
        }
      })
    },
    hamburgerListener: function(){
      $(document).on('click', '#t-mobileicon', function(){
        $('html').toggleClass('disable');
        $(this).toggleClass('active');
        $('#t-navitems').toggleClass('active');
        $('#t-overlay').toggleClass('active');
      })
    },
    homeListener: function(ev){
      $(document).on("click", "#navhome", function(ev){
        ev.preventDefault();
        app.disableOverlay();
        app.outputGunsReport();
      })
    },
    imgPath: function(obj){
      return obj.substring(obj.lastIndexOf("/")+1, obj.length);
    },
    init: function() {
      // app.getAllGuns().then(app.outputGunsReport);
      app.getAllGuns().then(app.landingPage);
      app.hamburgerListener();
      app.filterSearch();
      app.singleEntryListener();
      app.buildAddAGunTemplate();
      app.createGun();
      app.logoListener();
      app.homeListener();
      app.searchListener();
      app.summaryListener();
      app.landingPgListener();
    },
    landingPage: function(){
      template = '<div class="landing"><h1 class="landing">Welcome to Gunbase</h1>';
      template += '<div class="landing-text"><p>Gunbase is a database for your firearms collection';
      template += ' that keeps track of the important legal information for each of your firearms.</p><p>I developed';
      template += ' this app because I have been a competitive shooter for some years and simply acquired too many guns, and I';
      template += ' needed a way to keep track of them all.  I guess I have become like the carpenter who kept buying new hammers.</p></div>';
      template += '<div class="landingbtnwrapper"><button class="clanding-btn" id="landing-btn">Proceed</button></div></div>';
      $("#output").html(template);
    },
    landingPgListener: function(){
      $(document).on("click", "#landing-btn", function(){
        app.outputGunsReport();
      })
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
    logoListener: function(){
      $(document).on("click", "#navhome1", function(ev){
        ev.preventDefault();
        app.outputGunsReport();
      })
    },
    outputGunsReport: function() {
      var template = '<form class="centered" class="ctop-find" id="top-form-find"><input type="text" id="top-find" placeholder="Search for manufacturers" /></form>';
          template += '<ul class="list-one" id="list-top">';
          // This line is for the column headers
          template += '<li class="itemdata centered cf"><div class="listhdr">Type</div><div class="listhdr">Manufacturer</div><div class="listhdr">Model</div><div class="listhdr">Chambering</div></li>';
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
    searchListener: function(){
      $(document).on("click", "#navsearch", function(){
        app.disableOverlay();
        console.log('Nav Search clicked')
        var template = '<div class="formWrap"><h3 class="search_for_gun">Search for Gun</h3><form id="findagun_form">';
        template += '<input id="manufacturer" type="text" placeholder="manufacturer" name="manufacturer">';
        template += '<input id="model"  type="text" placeholder="model" name="model">';
        template += '<input id="chambering"  type="text" placeholder="chambering" name="chambering">';
        template += '<input id="type" type="text" placeholder="type" name="type">';
        template += '<input  id="serial_number" type="text" placeholder="serial_number" name="serial_number">';
        template += '<input id="image" type="text" placeholder="image" name="image">'
        template += '<input id="value" type="text" placeholder="value" name="value">';
        template += '<input id="sold" type="text" placeholder="sold" name="sold">';
        template += '<input id="buyer" type="text" placeholder="buyer" name="buyer">';
        template += '<br><div class="btn_wrapper"><button type="submit" id="search_gun_submit">Submit</submit></div>';
        template += '</form></div>';
        $("#output").html(template);
        // Collect info from the search fields
        $("#search_gun_submit").click(function(e){
          e.preventDefault();
          gunObj = {
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
          //searchKeys are the fields the user is looking for
          var searchKeys = {};
          //Update the state.guns to be sure it's fully populated.
          //This seems to fix a long-standing 'delay' bug in the update function.
          app.getAllGuns();
          //searchList is a big list to be whittled down...
          var searchList = state.guns;
          for (var [key, value] of Object.entries(gunObj)) {
            if (value) { searchKeys[key] = value; }
          }
          console.log('Looking for: ', searchKeys);
          // newArray will contain only matching guns to be returned to user
          let newArray = searchList.filter(function(gun, index, array) {
            Object.keys(searchKeys).forEach(function(key) {
              if (!gun[key].toLowerCase().includes(searchKeys[key].toLowerCase())) {
                gun['delete'] = true;
              }
            });
            // return only guns *without* gun.delete=true
            return !gun.delete;
          });
          let returnTemplate = '<div id="edit_guns">';
          returnTemplate += '<ul class="list-one" id="list-top">';
          newArray.forEach(function(gun){
            let gunicon = app.getIcon(gun.type)
            returnTemplate += `<li class="cf"><div class="vcenter"><div class="itemdata centered" data-gunobj="${gun.id}"><div class="nimg"><img src="icons/${gunicon}" alt="Gun icon"/></div></div><div class="itemdata" data-gunobj="${gun.id}">${gun.manufacturer}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.model}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.chambering}</div></div></li>`;
          })
          returnTemplate += "</ul>";
          console.log('newArray size: ', newArray.length);
          if (newArray.length === 0) returnTemplate += "No Guns Found.";
          returnTemplate += '</div>';
          $("#output").html(returnTemplate);
          console.log('NewArray returned: ', newArray);
        })
      })
    },
    singleEntryListener: function() {
      $(document).on("click", ".itemdata", function(ev){
        var targetId = $(ev.target).data('gunobj');
        app.getOneGun(targetId);
      })
    },
    summaryListener: function(){
      $(document).on("click", "#summary", function(ev){
        ev.preventDefault();
        app.disableOverlay();
        app.createSummaryPg();
      })
    },
    updateGun: function(updateData, gunId){
      var myURL = app.rootURL + '/' + gunId;
      $.ajax({
        url: myURL,
        type: 'PUT',
        headers: {
          "accept": "application/json;odata=verbose",
        },
        data: JSON.stringify(updateData),
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function(gundata) {
          console.log('Gun updated!  Object: ',gundata);
          app.getAllGuns()
          .then(app.outputGunsReport);
        },
        error: function(error){
          console.log('Update failed.  Error: ', error);
        }
      })
    },
    rootURL: 'http://localhost:8080/guns'
    // rootURL: 'https://firearmbase.herokuapp.com/guns'
  };

  const state = {
    guns: []
  }

  $(document).ready(function() {
    app.init();
  })
})(window.jQuery)
