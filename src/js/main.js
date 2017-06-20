//########################################################
//###############   STATE OBJECT and CONSTANTS  ##########
//########################################################
const state = {
  guns: []
}

var template = '';
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

function outputGunsReport() {
  // return new Promise( (res, rej) => {
    template = '<div>'
    state.guns.forEach( gun => {
      console.log('THREE: ', typeof gun)
      template += '<p>'+gun.fullName+'</p>'
    })
    template += '</div>'
    console.log('2nd promise--template: ', template);
    $("#output").html(template);
  // });
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

// function outputGuns(template){
//   $("#output").html(template);
// }

//var content = outputGuns();
//console.log('Content: ', template)

// $("#output").html(template);





//#########################################################
//#################  PROGRAM CONTROL FLOW  ################
//#########################################################
