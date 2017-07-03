//########################################################
//###############   STATE OBJECT and CONSTANTS  ##########
//########################################################
const state = {
  guns: []
}



//const rootURL = 'http://localhost:8080/guns';

const rootURL = 'https://firearmbase.herokuapp.com/guns';

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
.then(showMenu);

//#########################################################
//#################  DOM MODIFICATION METHODS  ############
//#########################################################



function outputGunsReport() {
  // return new Promise( (res, rej) => {
    var template = '<div>';
    state.guns.forEach( gun => {
      console.log('ONE: ', typeof gun);
      template += '<p>'+gun.fullName+'</p>';
    })
    template += '<button id="home_page">Home</button>';
    template += '</div>';
    console.log('state.guns object ', state.guns);
    $("#output").html(template);
    $("#home_page").click(function(){
      showMenu();
    })
  // });
}

//#########################################################
//#################  DATABASE METHODS      ################
//#########################################################

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
  getAllGuns();
  showMenu();
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
      template += `<input id="manufacturer" type="text" placeholder="${gundata.manufacturer}" name="manufacturer">`;
      template += `<input id="model"  type="text" placeholder="${gundata.model}" name="model">`;
      template += `<input id="chambering"  type="text" placeholder="${gundata.chambering}" name="chambering">`;
      template += `<input id="type" type="text" placeholder="${gundata.type}" name="type">`;
      template += `<input  id="serial_number" type="text" placeholder="${gundata.serial_number}" name="serial_number">`;
      template += `<input id="image" type="text" placeholder="${gundata.image}" name="image">`;
      template += `<input id="value" type="text" placeholder="${gundata.value}" name="value">`;
      template += `<input id="sold" type="text" placeholder="${gundata.sold}" name="sold">`;
      template += `<input id="buyer" type="text" placeholder="${gundata.buyer}" name="buyer">`;
      template += '<button type="submit" id="update_gun_submit">Submit</submit> ';
      template += '<button type="submit" id="delete_gun_submit">Delete?</submit>';
      template += '<button type="submit" id="load_home_page">Home</submit>';
      template += '</form></div>';
      $("#output").html(template);

      $("#load_home_page").click(function(){
        showMenu();
      })

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
  .then(showMenu);
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
  getAllGuns().then(showMenu);
}


//#########################################################
//#################  PROGRAM CONTROL FLOW  ################
//#########################################################

//This function shows the opening menu
function showMenu(){
  var template = '<div>'
  template += '<button id="list_all">List All Guns</button>';
  template += '<button id="create_gun">Add Gun</button>';
  template += '<button id="read_gun">Find Gun</button>';
  template += '</div>';

  $("#output").html(template);

  // List all guns
  $("#list_all").click(function(){
    outputGunsReport();
  })

  // Add a gun to database
  $("#create_gun").click(function(){

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
  })  //end of #create_gun listener

  //Search for a gun in the state.guns object
  $("#read_gun").click(function(){
    console.log('Find gun clicked')
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
          // if(searchKeys[key] !== gun[key]) {
          if (!gun[key].includes(searchKeys[key])) {
            gun['delete'] = true;
          }
        });
        return !gun.delete;
      });



      let returnTemplate = '<div id="edit_guns">';
      newArray.forEach(function(gun){
        console.log('newArray size: ', newArray.length);
        returnTemplate += '<p>'+gun.fullName+
        `<button class="update_gun" data-gunobj="${gun.id}">Update or Delete</button>`;
      })

      if (newArray.length === 0) returnTemplate += "No Guns Found.";

      // put the 'home' button on the page
      returnTemplate += '<button id="home_page">Home</button>';
      returnTemplate += '</div>';

      $("#output").html(returnTemplate);

      $("#home_page").click(function(){
        showMenu();
      })

      $("#edit_guns").click('.update_gun', function(ev) {
        var targetId = $(ev.target).data('gunobj');
        console.log('ClickHandler!  target id:', targetId);

        getOneGun(targetId);
      })

      console.log('NewArray returned: ', newArray);
    })
  })  //end of searchgun menu pick


  // $("#update_gun").click(function(){
  //   console.log('Update gun clicked')
  // })


  // $("#delete_gun").click(function(){
  //   console.log('Delete gun clicked')
  // })

}  // end of showMenu()
