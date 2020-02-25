const app_id = Knack.app.id;
const api_key = 'f9b2e440-4f75-11ea-9358-cff65e062c5b';

$(document).on('knack-form-submit.view_86', function(event, view, record) {
  var qty = $('#view_86-field_83').value;
  var headers = {
    "X-Knack-Application-ID": app_id,
    "X-Knack-REST-API-Key": api_key
  };
  var recordId = record.field_82_raw[0].id;
  $.ajax({
    url: 'https://api.knack.com/v1/objects/object_2/records/' + recordId,
    type: 'GET',
    headers: headers,
    success: function(res) {
      //var record = res.record;
      //console.log(res);
      var title = res.field_5; // product name
      var productId = res.field_6; // product ID
      var img = res.field_7; // img tag
      var desc = res.field_8; // description
      var price = res.field_9; // price
      
    }
  });


  // $('#kn-page-modal-0').prepend('\
  //   <div class="product">\
  //     <div class="product-image"></div>\
  //   </div>');
  
});