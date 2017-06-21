//########################################################
//###############   STATE OBJECT and CONSTANTS  ##########
//########################################################
const state = {
  guns: []
}

//var template = '';


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
        //console.log('StateObject: ',state.guns);
        console.log('first promise hit');
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
    console.log('outputGunsReport template: ', template);
    $("#output").html(template);
    $("#home_page").click(function(){
      showMenu();
    })
  // });
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

  $("#list_all").click(function(){
    outputGunsReport();
  })

  $("#create_gun").click(function(){
    console.log('Create_gun clicked')
  })

  $("#read_gun").click(function(){
    console.log('Find gun clicked')
  })

  $("#update_gun").click(function(){
    console.log('Update gun clicked')
  })

  $("#delete_gun").click(function(){
    console.log('Delete gun clicked')
  })

}
