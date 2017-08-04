//########################################################
//###############   STATE OBJECT and CONSTANTS  ##########
//########################################################
const state = {
  guns: []
}



const rootURL = 'http://localhost:8080/guns';

// const rootURL = 'https://firearmbase.herokuapp.com/guns';

//#########################################################
//#################  STATE MODIFICATION METHODS  ##########
//#########################################################

function getAllGuns() {
  return new Promise(function (res, rej) {
    $.ajax({
      crossOrigin: true,
      url: rootURL,
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
  //return state;
}


getAllGuns()

.then(outputGunsReport);
// .then(showLandingPg);

//#########################################################
//#################  DOM MODIFICATION METHODS  ############
//#########################################################

// This function creates the summary page
function createSummaryPg(){
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

  template = `<div class="summaryWrap"><h2>Summary</h2>
  <h3 class="summaryHdr">Pistols</h3><h3 class="summaryHdr">Revolvers</h3><h3 class="summaryHdr">Rifles</h3>
  <div class="summaryDiv">${pistols}</div><div class="summaryDiv">${revolvers}</div><div class="summaryDiv">${rifles}</div>
  <h3 class="summaryHdr">Shotguns</h3><h3 class="summaryHdr">Others</h3><h3 class="summaryHdr">Total Guns</h3>
  <div class="">${shotguns}</div><div class="">${others}</div><div class="">${totalguns}</div>
  <h3 class="summaryHdr">Value</h3><div class="summaryDiv">${value}</div></div>`;

  //event listener for summary report
  $("#summary").click(function(e){
    e.preventdefault();
    $("#output").html(template);

  })
}

// Function for showing credits for icons
function showCredits(){
  template = '<div class="credits">'
  template += '<h3>Credits</h3>'
  template += '<p class="creditPerson">revolver.png..........Simon Child</p>'
  template += '<p class="creditPerson">shotgun.png..........Simon Child</p>'
  template += '<p class="creditPerson">1911.png..........Alexandr Cherkinsky</p>'
  template += '<p class="creditPerson">glock.png..........Alexandr Cherkinsky</p></div>';

  $("#attributions").click(function(e){
    e.preventdefault();
    $("#output").html(template);
  })
}

// Show the page that a user first sees when visiting the site
function showLandingPg(){
  template = '<div class="landing"><h1 class="landing">Welcome to Gunbase</h1>';
  template += '<div class="landing-text">Gunbase is a database for your firearms collection';
  template += 'that keeps track of the important and legal information for each of your firearms.';
  template += '<button id="landing-btn">Proceed</button></div>';

  $("#output").html(template);

  $("#landing-btn").click(function(){
    outputGunsReport();
  })

}

// Get the right icon for each type of gun in the listing
function getIcon(type){
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
}

// This prettifies the path so the user doesn't have to
// remember to type 'img/path'
function imgPath(obj){
  return obj.substring(obj.lastIndexOf("/")+1, obj.length);
}

// This function now represents the Main Navigational Page
// that the user sees first.  There's a nav header in the index.html
function outputGunsReport() {
    console.log('outputGunsReport() called!');
    // Set up the output template that will be the main page for the app
    // There's a switch statement that chooses the gun's icon
    var template = '<form class="centered" id="top-form-find"><input type="text" id="top-find" placeholder="Search for manufacturers" /></form>';
        template += '<ul class="list-one" id="list-top">';
    state.guns.forEach( gun => {

      let gunicon = getIcon(gun.type)
      template += `<li class="cf"><div class="vcenter"><div class="itemdata centered" data-gunobj="${gun.id}"><div class="nimg"><img src="icons/${gunicon}" alt="Gun icon"/></div></div><div class="itemdata" data-gunobj="${gun.id}">${gun.manufacturer}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.model}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.chambering}</div></div></li>`;
    }) // end of forEach

    template += '</ul>';

    // Display all guns to screen
    $("#output").html(template);

    // #############################################
    // FILTERING SEARCH listener on Search field
    // #############################################

    $(document).on('input', "#top-form-find", function(){
      let criteria = $("#top-find").val();
      loadFindData(criteria);
    });

    // Listen for click on any individual guns
    // I'm using jQuery's ability to preserve object data-gunobj (gun.id)
    // and storing that in the data-gunobj attribute in the itemdata class
    $(".itemdata").click(function(ev){
      var targetId = $(ev.target).data('gunobj');
      console.log(targetId, ' Item clicked!')
      getOneGun(targetId);
    })

    // NAV HEADER: Listen for Add Gun click
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
      template += '<br><div class="btn_wrapper"><button type="submit" id="create_gun_submit">Submit</submit></div>';
      template += '</form></div>';

      // This will be the form the user fills out to add a
      // gun to the database
      $("#output").html(template);

      // gunObj is what will eventually gets added to the database
      $("#create_gun_submit").click(function(e){
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

        gunObj.image = `img/${gunObj.image}`;

        console.log("submitting this gun to Db: ",gunObj);
        // I had originally thought I could use gunDbTalk() for everything...
        // I'm not so sure now, but it still works for adding guns to the
        // database
        gunDbTalk(gunObj, "POST");
      })
    }) //end of #navaddgun listener


    // NAVBAR SEARCH: Listen for clicks on Adv. Search
    // Replaces search for guns on 'main menu'  (no longer have main menu)
    $("#navsearch").click(function(){
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
        getAllGuns();
        //searchList is a big list to be whittled down...
        var searchList = state.guns;
        for (var [key, value] of Object.entries(gunObj)) {
          if (value) { searchKeys[key] = value; }
        }

        console.log('Looking for: ', searchKeys);

        // newArray will contain only matching guns to be returned to user
        let newArray = searchList.filter(function(gun, index, array) {
          Object.keys(searchKeys).forEach(function(key) {
            if (!gun[key].includes(searchKeys[key])) {
              gun['delete'] = true;
            }
          });
          // return only guns *without* gun.delete=true
          return !gun.delete;
        });

        let returnTemplate = '<div id="edit_guns">';
        returnTemplate += '<ul class="list-one" id="list-top">';
        newArray.forEach(function(gun){
          let gunicon = getIcon(gun.type)
          returnTemplate += `<li class="cf"><div class="vcenter"><div class="itemdata centered" data-gunobj="${gun.id}"><div class="nimg"><img src="icons/${gunicon}" alt="Gun icon"/></div></div><div class="itemdata" data-gunobj="${gun.id}">${gun.manufacturer}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.model}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.chambering}</div></div></li>`;

        })

        returnTemplate += "</ul>";
        console.log('newArray size: ', newArray.length);
        if (newArray.length === 0) returnTemplate += "No Guns Found.";
        returnTemplate += '</div>';

        $("#output").html(returnTemplate);

        console.log('NewArray returned: ', newArray);
      })
    }) // End of Gun Search click Listener


    // Listen for clicks on 'Home' in navbar
    $("#navhome").click(function(e){
      e.preventDefault();
      console.log('navhome clicked');
      // location.reload();
      outputGunsReport();
    })

    // Listen for click on 'GunBase' Logo
    $("#navhome1").click(function(e){
      e.preventDefault();
      console.log('navhome1 Logo clicked');
      // location.reload();
      outputGunsReport();
    })

    // hamburger icon listener
    // $(document).on('click', '#themobile', function(){
    $(document).on('click', '#t-mobileicon', function(){
      $('html').toggleClass('disable');
      // $('#theburger').toggleClass('active');
      // $('#thenavs').toggleClass('active');   // not working
      // $('#theiphone').toggleClass('inactive');  // not working
      $(this).toggleClass('active');
      $('#t-navitems').toggleClass('active');
      $('#t-overlay').toggleClass('active');
    })

  }  // end of outputGunsReport()


//#########################################################
//#################  DATABASE METHODS      ################
//#########################################################


// I was thinking this one method might eventually be used for all methods
// Not sure if that's a good idea though.
// Now it's just used for adding a gun to the db
function gunDbTalk(gunData, http_method){
  console.log('gunTalk ', gunData);
  if (gunData.id) myURL = rootURL + "/" + gunData.id;
  else myURL = rootURL;
    $.ajax({
      url: myURL,
      type: http_method,
      headers: {
        "accept": "application/json;odata=verbose",
      },
      data: JSON.stringify(gunData),
      contentType: "application/json; charset=utf-8",
      dataType: 'json',
      success: function(gundata) {

        console.log('gunDbTalk() Object: ',gundata);
        getAllGuns()
        .then(outputGunsReport);
        // res();
      },
      error: function(error){
        console.log('error: ',error);
      }
    })

}

//GET single gun from db
//From here the user can either update or delete the record or go to home menu
function getOneGun(gunId){
  //console.log('UPDATE: You want to update: ',gunId)
  var myURL = rootURL + '/' + gunId;
  $.ajax({
    url: myURL,
    type: 'GET',
    headers: {
      "accept": "application/json;odata=verbose",
    },
    //data: JSON.stringify(gunId),
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
      template += `<input id="image" type="text" placeholder="${imgPath(gundata.image)}" name="image" value="${imgPath(gundata.image)}">`;
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


      // Update_gun listener
      $("#update_gun_submit").click(function(ev){
        ev.preventDefault();
        let fields = ['manufacturer', 'model', 'chambering', 'type', 'serial_number', 'image', 'value', 'sold', 'buyer'];

        let updateData = {};
        updateData.id = `${gunId}`;

        //Modify this so you can update more than one field!!!
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
        updateGun(updateData, gunId);
      })

      //If the delete button gets pressed...
      // ###################################
      $("#delete_gun_submit").click(function(ev){
        ev.preventDefault();
        console.log('Deleting gun with id: ', gunId);

        deleteGun(gunId);

      })
    },
    error: function(error){
      console.log('error *getting* the record: ',error);
    }
  })
}  // End of getOneGun()  (Includes calls to deleteGun() and updateGun() and showMenu()! )

// ###########################
// Update a single gun record
//############################
function updateGun(updateData, gunId){
  var myURL = rootURL + '/' + gunId;
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
      getAllGuns()
      .then(outputGunsReport);
      // res();
    },
    error: function(error){
      console.log('Update failed.  Error: ',error);
    }
  })
  // getAllGuns()
    // .then(outputGunsReport);

}


//Delete a single gun from db
function deleteGun(gunId){
  console.log('Do you really want to delete this gun: ', gunId);
  var myURL = rootURL + '/' + gunId;
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
      getAllGuns()
        .then(outputGunsReport);

    },
    error: function(error){
      console.log('Update failed.  Error: ',error);
    }
  })


}


//#########################################################
//#################  PROGRAM CONTROL FLOW  ################
//#########################################################

// FILTERING SEARCH METHOD that gets loaded from top page
function loadFindData(criteria) {
  console.log('LOAD FIND DATA!!!  -> ',criteria)
  if (!criteria){

    console.log('No Criteria! ',criteria);

    $("#list-top").empty();

    state.guns.forEach((gun, index, array) => {
      let gunicon = getIcon(gun.type);
      $("#list-top").append(`<li class="cf"><div class="vcenter"><div class="itemdata centered" data-gunobj="${gun.id}"><div class="nimg"><img src="icons/${gunicon}" alt="Gun icon"/></div></div><div class="itemdata" data-gunobj="${gun.id}">${gun.manufacturer}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.model}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.chambering}</div></div></li>`);
    })
  } else {

    let selections = state.guns.filter( gun => {
      return gun.manufacturer.toLowerCase().includes(criteria.toLowerCase());
    });
    $("#list-top").empty();
    selections.forEach((gun, index, array) => {
      let gunicon = getIcon(gun.type);

      $("#list-top").append(`<li class="cf"><div class="vcenter"><div class="itemdata centered" data-gunobj="${gun.id}"><div class="nimg"><img src="icons/${gunicon}" alt="Gun icon"/></div></div><div class="itemdata" data-gunobj="${gun.id}">${gun.manufacturer}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.model}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.chambering}</div></div></li>`);
      $(".itemdata").click(function(ev){
        var targetId = $(ev.target).data('gunobj');
        getOneGun(targetId);
      });
    });
  }
}
