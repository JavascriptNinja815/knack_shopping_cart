const app_id = Knack.app.id;
const api_key = 'f9b2e440-4f75-11ea-9358-cff65e062c5b';

$(document).on('knack-form-submit.view_86', function (event, view, record) {
  var qty = $('#view_86-field_83').value;
  var headers = {
    "X-Knack-Application-ID": app_id,
    "X-Knack-REST-API-Key": api_key
  };

  var recordId = record.field_82_raw[0].id;
  var qty = record.field_83_raw;

  $.ajax({
    url: 'https://api.knack.com/v1/objects/object_2/records/' + recordId,
    type: 'GET',
    headers: headers,
    success: function (res) {
      var title = res.field_5_raw; // product name
      var productId = res.field_6_raw; // product ID
      var img = res.field_7; // img tag
      var desc = res.field_8_raw; // description
      var price = res.field_9_raw; // price
      var productPrice = (parseFloat(price) * parseInt(qty)); // product price
      var interval = setInterval(cartModal, 1000);

      function cartModal() {
        var timer = 0;
        if ($('#kn-page-modal-0')) {
          clearInterval(interval);
          $('#kn-page-modal-0').prepend('\
            <div class="shopping-cart">\
              <div class="column-labels">\
                <label class="product-image">Image</label>\
                <label class="product-details">Product</label>\
                <label class="product-price">Price</label>\
                <label class="product-quantity">Quantity</label>\
                <label class="product-removal">Remove</label>\
                <label class="product-line-price">Total</label>\
              </div>\
              \
              <div class="product">\
                <div class="product-image">' + img + '</div>\
                <div class="product-details">\
                  <div calss="product-title">' + title + '</div>\
                  <p class="product-description">' + desc + '</p>\
                </div>\
                <div class="product-price">' + price + '</div>\
                <div class="product-quantity">\
                  <input type="number" value="' + qty + '" min="1">\
                </div>\
                <div class="product-removal">\
                  <button class="remove-product"> Remove </button>\
                </div>\
                <div class="product-line-price">' + productPrice + '</div>\
              </div>\
            </div>\
          ');
        } else {
          timer++;
          if (timer > 5) {
            clearInterval(interval);
          }
        }
      }
    }
  });
});