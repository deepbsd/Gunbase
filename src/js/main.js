//########################################################
//###############   STATE OBJECT and CONSTANTS  ##########
//########################################################
const state = {
  guns: []
}

const rootURL = 'http://localhost:8080/guns';

//#########################################################
//#################  STATE MODIFICATION METHODS  ##########
//#########################################################

function getAllGuns() {
  return new Promise(function (res, rej) {
    $.ajax({
      url: rootURL,
      type: "GET",
      headers: {
        "accept": "application/json;odata=verbose",
      },
      success: function(gundata) {
        gundata.forEach( gun => {

          state.guns[gun.fullName] = gun;
        });
        console.log('StateObject: ',state.guns);
      },
      error: function(error){
        console.log('error: ',error);
      }
    })
  })
}

getAllGuns();



//#########################################################
//#################  DOM MODIFICATION METHODS  ############
//#########################################################

function outputGuns(){
  var template = '<div>';
  state.guns.forEach(gun => {
    template += `<p>${gun.fullName}</p>`
  })
  return template + '</div>'
}

var content = outputGuns();

$('.output').html(content);





//#########################################################
//#################  PROGRAM CONTROL FLOW  ################
//#########################################################
