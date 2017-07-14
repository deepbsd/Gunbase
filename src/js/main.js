//########################################################
//###############   STATE OBJECT and CONSTANTS  ##########
//########################################################
const state = {
  guns: []
}



const rootURL = 'http://localhost:8080/guns';

//const rootURL = 'https://firearmbase.herokuapp.com/guns';

//#########################################################
//#################  STATE MODIFICATION METHODS  ##########
//#########################################################

function getAllGuns() {
  return new Promise(function (res, rej) {
    $.ajax({
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
        res();
      },
      error: function(error){
        console.log('error: ',error);
      }
    })
  })
  return state;
}


getAllGuns()
//.then(showMenu);
.then(outputGunsReport);

//#########################################################
//#################  DOM MODIFICATION METHODS  ############
//#########################################################


// This function now represents the Main Navigational Page
// that the user sees first.  There's a nav header in the index.html
function outputGunsReport() {

    var template = '<form class="centered"><input type="text" id="top-find" placeholder="Search for manufacturers" /></form>';
        template += '<ul class="list-one">';
    state.guns.forEach( gun => {
      console.log('ONE: ', typeof gun);
      // template += `<li class="cf"><div class="vcenter"><div class="itemdata" data-gunobj="${gun.id}">${gun.type}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.manufacturer}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.model}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.chambering}</div></div></li>`;
      template += `<li class="cf"><div class="vcenter"><div class="itemdata centered" data-gunobj="${gun.id}"><div class="nimg"><img src="icons/glock.png" alt="Gun icon"/></div></div><div class="itemdata" data-gunobj="${gun.id}">${gun.manufacturer}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.model}</div><div class="itemdata" data-gunobj="${gun.id}">${gun.chambering}</div></div></li>`;
    })

    template += '</ul>';

    template += '<button id="home_page">Home</button>';
    console.log('state.guns object ', state.guns);

    // Display all guns to screen
    $("#output").html(template);

    //Listen for click on any individual guns
    $(".itemdata").click(function(ev){
      var targetId = $(ev.target).data('gunobj');
      console.log(targetId, ' Item clicked!')
      getOneGun(targetId);
    })

    // NAV HEADER: Listen for Add Gun click
    $("#navaddgun").click(function(){
      var template = `<div><form>`;
      template += '<input id="manufacturer" type="text" placeholder="manufacturer" name="manufacturer">';
      template += '<input id="model"  type="text" placeholder="model" name="model">';
      template += '<input id="chambering"  type="text" placeholder="chambering" name="chambering">';
      template += '<input id="type" type="text" placeholder="type" name="type">';
      template += '<input  id="serial_number" type="text" placeholder="serial_number" name="serial_number">';
      template += '<input id="image" type="text" placeholder="image" name="image">'
      template += '<input id="value" type="text" placeholder="value" name="value">';
      template += '<input id="sold" type="text" placeholder="sold" name="sold">';
      template += '<input id="buyer" type="text" placeholder="buyer" name="buyer">';
      template += '<button type="submit" id="create_gun_submit">Submit</submit> ';
      template += '</form></div>';

      $("#output").html(template);

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

        console.log("From showmenu() ",gunObj);
        gunDbTalk(gunObj, "POST");
      })
    }) //end of #navaddgun listener


    // NAVBAR SEARCH: Listen for clicks on Search/Edit
    // Replaces search for guns on 'main menu'
    $("#navsearch").click(function(){
      console.log('Nav Search clicked')
      var template = '<div><h3 class="search_for_gun">Search for Gun</h3><form>';
      template += '<input id="manufacturer" type="text" placeholder="manufacturer" name="manufacturer">';
      template += '<input id="model"  type="text" placeholder="model" name="model">';
      template += '<input id="chambering"  type="text" placeholder="chambering" name="chambering">';
      template += '<input id="type" type="text" placeholder="type" name="type">';
      template += '<input  id="serial_number" type="text" placeholder="serial_number" name="serial_number">';
      template += '<input id="image" type="text" placeholder="image" name="image">'
      template += '<input id="value" type="text" placeholder="value" name="value">';
      template += '<input id="sold" type="text" placeholder="sold" name="sold">';
      template += '<input id="buyer" type="text" placeholder="buyer" name="buyer">';
      template += '<button type="submit" id="search_gun_submit">Submit</submit> ';
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
        //searchList is a big list to be whittled down...
        var searchList = state.guns;
        for (var [key, value] of Object.entries(gunObj)) {
          if (value) { searchKeys[key] = value; }
        }

        //Why are some guns not being returned?
        console.log('Looking for: ', searchKeys);

        // newArray will contain only matching guns to be returned to user
        let newArray = searchList.filter(function(gun, index, array) {
          Object.keys(searchKeys).forEach(function(key) {
            if (!gun[key].includes(searchKeys[key])) {
              gun['delete'] = true;
            }
          });
          return !gun.delete;
        });

        let returnTemplate = '<div id="edit_guns">';
        newArray.forEach(function(gun){
          returnTemplate += '<p>'+gun.fullName+
          `<button class="update_gun" data-gunobj="${gun.id}">Update/Delete</button>`;
        })

        console.log('newArray size: ', newArray.length);

        if (newArray.length === 0) returnTemplate += "No Guns Found.";

        // put the 'home' button on the page
        returnTemplate += '<button id="home_page">Home</button>';
        returnTemplate += '</div>';

        $("#output").html(returnTemplate);

        // 'Home' button at bottom of page
        $("#home_page").click(function(){
          //showMenu();
          outputGunsReport();
        })

        $("#edit_guns").click('.update_gun', function(ev) {
          var targetId = $(ev.target).data('gunobj');
          console.log('ClickHandler!  target id:', targetId);

          getOneGun(targetId);
        })

        console.log('NewArray returned: ', newArray);
      })
    }) // End of NavSearch click Listener


    // Listen for clicks on 'Home' in navbar
    $("#navhome").click(function(){
      console.log('navhome clicked')
      //Recursion here? side effects???
      outputGunsReport();
    })

}  // end of outputGunsReport()

//#########################################################
//#################  DATABASE METHODS      ################
//#########################################################


// I was thinking this one method might eventually be used for all methods
// Not sure if that's a good idea though.
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

        //console.log('StateObject: ',state.guns);
        console.log('HEY!  Object: ',gundata);
        // res();
      },
      error: function(error){
        console.log('error: ',error);
      }
    })
  getAllGuns()
  //showMenu();
  .then(outputGunsReport);
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
      template += `<label for="manufacturer">Manufacturer</label>`;
      template += `<input id="manufacturer" type="text" placeholder="${gundata.manufacturer}" name="manufacturer">`;
      template += `<label for="model">Model</label>`;
      template += `<input id="model"  type="text" placeholder="${gundata.model}" name="model">`;
      template += `<label for="chambering">Chambering</label>`;
      template += `<input id="chambering"  type="text" placeholder="${gundata.chambering}" name="chambering">`;
      template += `<label for="type">Type</label>`;
      template += `<input id="type" type="text" placeholder="${gundata.type}" name="type">`;
      template += `<label for="serial_number">Serial Number</label>`;
      template += `<input  id="serial_number" type="text" placeholder="${gundata.serial_number}" name="serial_number">`;
      template += `<label for="image">Image</label>`;
      template += `<input id="image" type="text" placeholder="${gundata.image}" name="image">`;
      template += `<label for="value">Value</label>`;
      template += `<input id="value" type="text" placeholder="${gundata.value}" name="value">`;
      template += `<label for="sold">Sold</label>`;
      template += `<input id="sold" type="text" placeholder="${gundata.sold}" name="sold">`;
      template += `<label for="buyer">Buyer</label>`;
      template += `<input id="buyer" type="text" placeholder="${gundata.buyer}" name="buyer">`;
      template += '<button type="submit" id="update_gun_submit">Submit</submit> ';
      template += '<button type="submit" id="delete_gun_submit">Delete?</submit>';
      template += '<button type="submit" id="load_home_page">Home</submit>';
      template += '</form></div>';
      $("#output").html(template);

      //Home page button listener (not used currently)
      $("#load_home_page").click(function(){
        // showMenu();
        outputGunsReport();
      })

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
            updateData[field] = `${thevalue}`
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

      //console.log('StateObject: ',state.guns);
      console.log('Gun updated!  Object: ',gundata);
      // res();
    },
    error: function(error){
      console.log('Update failed.  Error: ',error);
    }
  })
  getAllGuns()
    .then(outputGunsReport);
  // .then(showMenu);
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
    //data: JSON.stringify(updateData),
    contentType: "application/json; charset=utf-8",
    dataType: 'json',
    success: function() {

      console.log(`Gun ${gunId} deleted!`);
      // res();
    },
    error: function(error){
      console.log('Update failed.  Error: ',error);
    }
  })
  getAllGuns().then(outputGunsReport);
}


//#########################################################
//#################  PROGRAM CONTROL FLOW  ################
//#########################################################

//This function shows the opening menu
// We changed the app so we don't show this anymore.  We just
// go right to outputGunsReport()

// NO LONGER USED...
// function showMenu(){
//   var template = '<div>'
//   template += '<button class="topmenu" id="list_all">List All Guns</button>';
//   template += '<button class="topmenu" id="create_gun">Add a Gun</button>';
//   template += '<button class="topmenu" id="read_gun">Search Guns</button>';
//   template += '</div>';
//
//   $("#output").html(template);
//
//   // List all guns
//   $("#list_all").click(function(){
//     outputGunsReport();
//   })
//
//   // Add a gun to database
//   $("#create_gun").click(function(){
//
//     var template = `<div><form>`;
//     template += '<input id="manufacturer" type="text" placeholder="manufacturer" name="manufacturer">';
//     template += '<input id="model"  type="text" placeholder="model" name="model">';
//     template += '<input id="chambering"  type="text" placeholder="chambering" name="chambering">';
//     template += '<input id="type" type="text" placeholder="type" name="type">';
//     template += '<input  id="serial_number" type="text" placeholder="serial_number" name="serial_number">';
//     template += '<input id="image" type="text" placeholder="image" name="image">'
//     template += '<input id="value" type="text" placeholder="value" name="value">';
//     template += '<input id="sold" type="text" placeholder="sold" name="sold">';
//     template += '<input id="buyer" type="text" placeholder="buyer" name="buyer">';
//     template += '<button type="submit" id="create_gun_submit">Submit</submit> ';
//     template += '</form></div>';
//
//     $("#output").html(template);
//
//     $("#create_gun_submit").click(function(e){
//       e.preventDefault();
//       gunObj = {
//         manufacturer: $("#manufacturer").val(),
//         model: $("#model").val(),
//         chambering: $("#chambering").val(),
//         type: $("#type").val(),
//         serial_number: $("#serial_number").val(),
//         image: $("#image").val(),
//         value: $("#value").val(),
//         sold: $("#sold").val(),
//         buyer: $("#buyer").val()
//       }
//
//       console.log("From showmenu() ",gunObj);
//       gunDbTalk(gunObj, "POST");
//     })
//   })  //end of #create_gun listener
//
//   //Search for a gun in the state.guns object
//   $("#read_gun").click(function(){
//     console.log('Find gun clicked')
//     var template = '<div><h3 class="search_for_gun">Search for Gun</h3><form>';
//     template += '<input id="manufacturer" type="text" placeholder="manufacturer" name="manufacturer">';
//     template += '<input id="model"  type="text" placeholder="model" name="model">';
//     template += '<input id="chambering"  type="text" placeholder="chambering" name="chambering">';
//     template += '<input id="type" type="text" placeholder="type" name="type">';
//     template += '<input  id="serial_number" type="text" placeholder="serial_number" name="serial_number">';
//     template += '<input id="image" type="text" placeholder="image" name="image">'
//     template += '<input id="value" type="text" placeholder="value" name="value">';
//     template += '<input id="sold" type="text" placeholder="sold" name="sold">';
//     template += '<input id="buyer" type="text" placeholder="buyer" name="buyer">';
//     template += '<button type="submit" id="search_gun_submit">Submit</submit> ';
//     template += '</form></div>';
//
//     $("#output").html(template);
//
//     // Collect info from the search fields
//     $("#search_gun_submit").click(function(e){
//       e.preventDefault();
//       gunObj = {
//         manufacturer: $("#manufacturer").val(),
//         model: $("#model").val(),
//         chambering: $("#chambering").val(),
//         type: $("#type").val(),
//         serial_number: $("#serial_number").val(),
//         image: $("#image").val(),
//         value: $("#value").val(),
//         sold: $("#sold").val(),
//         buyer: $("#buyer").val()
//       }
//
//       //searchKeys are the fields the user is looking for
//       var searchKeys = {};
//       //searchList is a big list to be whittled down...
//       var searchList = state.guns;
//       for (var [key, value] of Object.entries(gunObj)) {
//         if (value) { searchKeys[key] = value; }
//       }
//
//       //Why are some guns not being returned?
//       console.log('Looking for: ', searchKeys);
//
//       // newArray will contain only matching guns to be returned to user
//       let newArray = searchList.filter(function(gun, index, array) {
//         Object.keys(searchKeys).forEach(function(key) {
//           if (!gun[key].includes(searchKeys[key])) {
//             gun['delete'] = true;
//           }
//         });
//         return !gun.delete;
//       });
//
//
//
//       let returnTemplate = '<div id="edit_guns">';
//       newArray.forEach(function(gun){
//         returnTemplate += '<p>'+gun.fullName+
//         `<button class="update_gun" data-gunobj="${gun.id}">Update/Delete</button>`;
//       })
//
//       console.log('newArray size: ', newArray.length);
//
//       if (newArray.length === 0) returnTemplate += "No Guns Found.";
//
//       // put the 'home' button on the page
//       returnTemplate += '<button id="home_page">Home</button>';
//       returnTemplate += '</div>';
//
//       $("#output").html(returnTemplate);
//
//       $("#home_page").click(function(){
//         showMenu();
//       })
//
//       $("#edit_guns").click('.update_gun', function(ev) {
//         var targetId = $(ev.target).data('gunobj');
//         console.log('ClickHandler!  target id:', targetId);
//
//         getOneGun(targetId);
//       })
//
//       console.log('NewArray returned: ', newArray);
//     })
//   })  //end of searchgun menu pick
//
//
//
// }  // end of showMenu()
