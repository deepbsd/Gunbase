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


// getAllGuns()
// .then(function () {
//   template = '<div>'
//   state.guns.forEach( gun => {
//     console.log('THREE: ', typeof gun)
//     template += '<p>'+gun.fullName+'</p>'
//   })
//   template += '</div>'
//   console.log('template: ', template);
//   return outputGuns(template);
// })
// .then(function(res) {
//     //$("#output").html(res);
//     outputGuns(res);
// })
//
// console.log('ONE:  State object: ', state.guns)

getAllGuns()
.then(outputGunsReport);

//#########################################################
//#################  DOM MODIFICATION METHODS  ############
//#########################################################



function outputGunsReport() {
  // return new Promise( (res, rej) => {
    var template = '<div>'
    state.guns.forEach( gun => {
      console.log('ONE: ', typeof gun)
      template += '<p>'+gun.fullName+'</p>'
    })
    template += '</div>'
    console.log('outputGunsReport template: ', template);
    $("#output").html(template);
  // });
}




//#########################################################
//#################  PROGRAM CONTROL FLOW  ################
//#########################################################

//This function shows the opening menu
function showMenu(){
  var template = ''
}
