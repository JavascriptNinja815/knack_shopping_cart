var app_id = Knack.app.id;
/*
// change "page_1" to the page you want to listen for
$(document).on('knack-page-render.scene_106', function(event, page) {
	
	// change page_1 and view_1 to the view that works with the logged-in user
	$.ajax({
	    url: 'https://api.knack.com/v1/pages/scene_106/views/view_200/records'
	  , type: 'GET'
	  , headers: {
	        'Authorization': Knack.getUserToken()      
	      , 'X-Knack-Application-Id': '54e7a73b266264a239f32a0b'
          , 'Content-Type': 'application/json'
	    }
	  , success: function(data) {
	      alert('Hello World');
    }
	});
}); 
  */



//Run Checklist
// change view_171 to the view you want to listen to
$(document).on('knack-record-create.view_171', function (event, view, record) {
  var user = Knack.getUserToken();
  //console.log ("Authorization: " + user);
  //console.log ("X-Knack-Application-ID: " + app_id);
  var headers = {
    "X-Knack-Application-ID": app_id,
    "X-Knack-REST-API-Key": "dd6f6cc0-ba4e-11e4-959c-9dd9646336ba",
    "Content-Type": "application/json"
  };
  var website = $('#view_171-field_196').val();
  var checklist = $('#view_171-field_203').val();
  var filters = [{
    field: 'field_76',
    operator: 'is',
    value: checklist
  }];
  // add to URL
  var api_url = '?filters=' + encodeURIComponent(JSON.stringify(filters));

  //console.log api_url;

  var checklistTasks = [];
  $.ajax({
    url: 'https://api.knack.com/v1/objects/object_16/records' + api_url + '&rows_per_page=500',
    type: 'GET',
    headers: headers,
    success: function (response) {

      //console.log (JSON.stringify(response));
      //console.log(JSON.stringify(response.records));

      var records = response.records;
      var timeOut = 150;

      records.forEach(function (record) {
        var taskName = record.field_75;
        var taskAssignee = record.field_219_raw[0].id;
        var taskNotes = record.field_78;
        var taskStatus = record.field_220_raw[0].id;
        var taskPriority = record.field_221_raw[0].id;
        var taskAssignedBy = '58479843e77a5f453b6ab65d';
        var taskCriticalPath = record.field_233;
        //var taskWebsite = record.field_240;

        if (record.field_240)

        {
          var taskWebsite = record.field_240_raw[0].id;
          console.log('true')
        } else {
          var taskWebsite = website;
          console.log('false')
        };

        console.log(taskName);
        console.log(taskWebsite);
        console.log(taskAssignee);
        //console.log(taskStatus);

        var data = {
          field_23: taskName,
          field_168: taskWebsite,
          field_216: taskAssignee,
          field_26: taskStatus,
          field_40: taskPriority,
          field_67: taskAssignedBy,
          field_217: taskNotes,
          field_234: taskCriticalPath,
          field_239: null
        };

        setTimeout(
          function () {
            console.log('Sending Post Request');
            $.ajax({
              url: 'https://api.knackhq.com/v1/objects/object_5/records/',
              type: 'POST',
              headers: headers,
              data: JSON.stringify(data),
              success: function (response) {
                //console.log(JSON.stringify(response));
              },
              dataType: "json"
            });

            console.log(timeOut);

          }, timeOut);

        timeOut += 400;

      });
      console.log('Done');
    }

  });

});

//=============================
//CHEATSHEET & MAINT REPORT

$(document).on('knack-scene-render.scene_57', function (event, scene) {
  $('#view_89 .kn-button-menu').append('<li><a href="#" id="webmerge" class="kn-button">Send Cheatsheet</a></li>');
  $('#view_89 .kn-button-menu').append('<li><a href="#" id="sendmaint" class="kn-button">Send Maintenance Report</a></li>');


  //Get todays date
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!

  var yyyy = today.getFullYear();
  if (dd < 10) {
    dd = '0' + dd
  }
  if (mm < 10) {
    mm = '0' + mm
  }
  var today = mm + '/' + dd + '/' + yyyy;
  //document.getElementById("DATE").value = today;


  // Send Cheatsheet
  $('#webmerge').click(function (event) {
    event.preventDefault();



    // get data
    var data = Knack.models['view_88'].toJSON();


    //site logins   
    var models = Knack.models['view_90'].data.models;
    var logins = [];
    for (var i = 0; i < models.length; i++) {
      log(models[i].attributes);
      if (models[i].attributes.field_241 == "Yes") {
        logins.push({
          name: models[i].attributes.field_127,
          loginurl: models[i].attributes.field_126,
          uname: models[i].attributes.field_129,
          pw: models[i].attributes.field_130,

        });
      }
    }



    //colors
    var colorview = Knack.models['view_92'].data.models;
    var colorlines = [];
    for (var i = 0; i < colorview.length; i++) {
      log(colorview[i].attributes);
      colorlines.push({
        colorname: colorview[i].attributes.field_139,
        hex: colorview[i].attributes.field_140,
      });
    }


    //imagehttps://builder.knackhq.com/keybridge/webtracker# sizes
    var imageview = Knack.models['view_93'].data.models;
    var imagelines = [];
    for (var i = 0; i < imageview.length; i++) {
      log(imageview[i].attributes);
      imagelines.push({
        imagename: imageview[i].attributes.field_141,
        imagesize: imageview[i].attributes.field_142,
      });
    }

    log('data!');
    log(models);
    log(colorview);
    log(imageview);
    log(data);
    Knack.showSpinner();

    $.ajax({
      url: 'https://www.webmerge.me/merge/49153/6dfuaj',
      data: {
        logins: logins,
        colorlines: colorlines,
        imagelines: imagelines,
        date: today,
        client: data.field_121,
        siteurl: data.field_122,
        cheatsheetnotes: data.field_183,

      },
      type: 'POST',
      success: function () {
        alert('Cheatsheet Sent!');
        Knack.hideSpinner();
      },
      error: function () {
        alert('There was an error creating the cheatsheet');
      }
    });
  });

  //======================================================================  

  // Send Maintenance Report
  $('#sendmaint').click(function (event) {
    event.preventDefault();

    // get site data
    var data = Knack.models['view_88'].toJSON();


    //Maintenance
    var maintview = Knack.models['view_162'].data.models;
    var maintlines = [];
    for (var i = 0; i < maintview.length; i++) {
      log(maintview[i].attributes);
      maintlines.push({
        mainttype: maintview[i].attributes.field_187,
        actdate: maintview[i].attributes.field_190,
        actnotes: maintview[i].attributes.field_189,
      });
    }

    //Theme
    var themeview = Knack.models['view_141'].data.models;
    var themelines = [];
    for (var i = 0; i < themeview.length; i++) {
      log(themeview[i].attributes);
      themelines.push({
        themename: themeview[i].attributes.field_152,
        tversion: themeview[i].attributes.field_153,
        tlastupdate: themeview[i].attributes.field_154,
      });
    }

    //Plugins
    var pluginview = Knack.models['view_91'].data.models;
    var pluginlines = [];
    for (var i = 0; i < pluginview.length; i++) {
      log(pluginview[i].attributes);
      pluginlines.push({
        pluginname: pluginview[i].attributes.field_181,
        pversion: pluginview[i].attributes.field_147,
        plastupdate: pluginview[i].attributes.field_148,
      });
    }

    log('data!');
    log(maintview);
    log(themeview);
    log(pluginview);
    log(data);
    Knack.showSpinner();


    $.ajax({
      url: 'https://www.webmerge.me/merge/49187/s5u271',
      data: {
        maintlines: maintlines,
        themelines: themelines,
        pluginlines: pluginlines,
        date: today,
        client: data.field_121,
        siteurl: data.field_122,
        wpversion: data.field_123,
        wplastupdate: data.field_194,
        maintplan: data.field_193,
        contactemail: data.field_245,
        maintemailsubject: data.field_273,
        maintemailtext: data.field_275,

      },
      type: 'POST',
      success: function () {
        alert('Maintenance Report Sent!');
        Knack.hideSpinner();
      },
      error: function () {
        alert('There was an error creating the maintenance report.');
      }
    });
  });


});