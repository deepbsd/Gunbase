//########################################################
//###############   STATE OBJECT and CONSTANTS  ##########
//########################################################
const state = {
  guns: []
}

//var template = '';


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

//Update db for a single gun
function updateGun(gunId){

}

//Delete a single gun from db
function deleteGun(gunId){

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
  template += '<button id="update_gun">Modify Gun</button>';
  template += '<button id="delete_gun">Delete Gun</button>';
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

      // newArray will contain only matching guns to be returned to user
      let newArray = searchList.filter(function(gun, index, array) {
        Object.keys(searchKeys).forEach(function(key) {
          if(searchKeys[key] !== gun[key]) {
            gun['delete'] = true;
          }
        });
        return !gun.delete;
      });

      let returnTemplate = '<div>'
      newArray.forEach(function(gun){
        returnTemplate += '<p>'+gun.fullName+
        '<button id="update_gun">update</button><button id="delete_gun">delete</button></p>';
      })
      // put the 'home' button on the page
      returnTemplate += '<button id="home_page">Home</button>';
      returnTemplate += '</div>'

      $("#output").html(returnTemplate);
      $("#home_page").click(function(){
        showMenu();
      })

      $("#update_gun").click(function(){
        console.log(this)
        //updateGun();
      })

      $("#delete_gun").click(function(){
        //deleteGun();
      })

      console.log('NewArray returned: ', newArray);
    })
  })  //end of searchgun menu pick



  $("#update_gun").click(function(){
    console.log('Update gun clicked')
  })



  $("#delete_gun").click(function(){
    console.log('Delete gun clicked')
  })

}  // end of showMenu()
