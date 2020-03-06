const app_id = Knack.app.id;
const api_key = 'f9b2e440-4f75-11ea-9358-cff65e062c5b';

const fadeTime = 300;
const headers = {
  "X-Knack-Application-ID": app_id,
  "X-Knack-REST-API-Key": api_key,
  "Content-Type": "application/json"
};

// Quantity Validation Before Submit Form
// $(document).on('knack-scene-render.scene_23', function(event, scene) {
//   $('#view_86 > form > div > button').disabled = true;
//   $('#view_86-field_83').on('change', function() {
//     if (this.value == '') {
//       console.log('called');
//       $('#view_86 > form > div > button').disabled = true;
//     } else {
//       $('#view_86 > form > div > button').disabled = false;
//     }
//   })
// });

// Update cart object when product is added in cart
$(document).on('knack-form-submit.view_86', function (event, view, record) {
  var userId = Knack.getUserAttributes().values.field_110; // userID
  var recordId = record.field_82_raw[0].id;
  var qty = record.field_83_raw; // quantity

  $.ajax({
    url: 'https://api.knack.com/v1/objects/object_2/records/' + recordId,
    type: 'GET',
    headers: headers,
    success: function (res) {
      var productId = res.field_6_raw; // product ID
      var api_url = 'https://api.knack.com/v1/objects/object_15/records';
      var filters = [{
        "field": "field_97",
        "operator": "is",
        "value": userId
      }, {
        "field": "field_100",
        "operator": "is",
        "value": productId
      }];

      api_url += '?filters=' + encodeURIComponent(JSON.stringify(filters));
      $.ajax({
        url: api_url,
        type: 'GET',
        headers: headers,
        success: function (res) {
          if (res.records.length == 0) {
            var data = JSON.stringify({
              field_97: userId,
              field_100: productId,
              field_101: qty
            });
            $.ajax({
              url: 'https://api.knack.com/v1/objects/object_15/records',
              type: 'POST',
              headers: headers,
              data: data,
              success: function (res) {
                console.log('created new record');
              }
            });
          } else {
            var recordId = res.records[0].id;
            var updatedQty = parseInt(qty) + parseInt(res.records[0].field_101);
            var data = JSON.stringify({
              field_101: updatedQty
            });
            $.ajax({
              url: 'https://api.knack.com/v1/objects/object_15/records/' + recordId,
              type: 'PUT',
              headers: headers,
              data: data,
              success: function (res) {
                console.log('updated existing record');
              }
            });
          }
        }
      });
    }
  });
});

// display cart page
$(document).on('knack-scene-render.scene_47', function (event, scene) {
  var userId = Knack.getUserAttributes().values.field_110; // userID
  var total = 0;
  $('#view_87 > form').prepend('\
    <div class="shopping-cart">\
      <div class="column-labels">\
        <label class="product-image">Image</label>\
        <label class="product-details">Product</label>\
        <label class="product-price">Price</label>\
        <label class="product-quantity">Quantity</label>\
        <label class="product-removal">Remove</label>\
        <label class="product-line-price">Total</label>\
      </div>\
      <div class="totals">\
        <div class="totals-item totals-item-total">\
          <label>Total</label>\
          <div class="totals-value" id="cart-total">' + total.toFixed(2) + '</div>\
        </div>\
      </div>\
  ');

  var api_url = 'https://api.knack.com/v1/objects/object_15/records';
  var filters = [{
    "field": "field_97",
    "operator": "is",
    "value": userId
  }];
  api_url += '?filters=' + encodeURIComponent(JSON.stringify(filters));

  $.ajax({
    url: api_url,
    type: 'GET',
    headers: headers,
    success: function (res) {
      for (var i in res.records) {
        var productId = res.records[i].field_100;
        var qty = parseInt(res.records[i].field_101);
        var filters = [{
          "field": "field_6",
          "operator": "is",
          "value": productId
        }];
        $.ajax({
          url: 'https://api.knack.com/v1/objects/object_2/records?filters=' + encodeURIComponent(JSON.stringify(filters)),
          type: 'GET',
          headers: headers,
          success: function (res) {
            var title = res.records[0].field_5_raw; // product name
            var img = res.records[0].field_7; // img tag
            var desc = res.records[0].field_8_raw; // description
            var price = parseFloat(res.records[0].field_9_raw); // price
            var productPrice = price * qty; // product price
            $('.shopping-cart > div:nth-child(1)').after('\
              <div class="product">\
                <div class="product-image">' + img + '</div>\
                <div class="product-details">\
                  <div calss="product-title">' + title + '</div>\
                  <p class="product-description">' + desc + '</p>\
                </div>\
                <div class="product-price">' + price.toFixed(2) + '</div>\
                <div class="product-quantity">\
                  <input type="number" value="' + qty + '" min="1">\
                </div>\
                <div class="product-removal">\
                  <button class="remove-product"> Remove </button>\
                </div>\
                <div class="product-line-price">' + productPrice.toFixed(2) + '</div>\
              </div>\
            ');
          }
        });
      }
      var interval = setInterval(customCartPage, 1000);

      function customCartPage() {
        var timer = 0;
        if ($('.product')) {
          recalculateCart();
          $('.product-quantity input').change(function () {
            updateQuantity(this);
          });

          $('.product-removal button').click(function () {
            removeItem(this);
          });

          /* Recalculate cart */
          function recalculateCart() {
            var total = 0;
            /* Sum up row totals */
            $('.product').each(function () {
              total += parseFloat($(this).children('.product-line-price').text());
            });

            /* Update totals display */
            $('.totals-value').fadeOut(fadeTime, function () {
              $('#cart-total').html(total.toFixed(2));
              if (total == 0) {
                $('#view_87 .kn-submit').fadeOut(fadeTime);
              } else {
                $('#view_87 .kn-submit').fadeIn(fadeTime);
              }
              $('.totals-value').fadeIn(fadeTime);
            });
          }

          /* Update quantity */
          function updateQuantity(quantityInput) {
            /* Calculate line price */
            var productRow = $(quantityInput).parent().parent();
            var price = parseFloat(productRow.children('.product-price').text());
            var quantity = $(quantityInput).val();
            var linePrice = price * quantity;

            /* Update line price display and recalc cart totals */
            productRow.children('.product-line-price').each(function () {
              $(this).fadeOut(fadeTime, function () {
                $(this).text(linePrice.toFixed(2));
                recalculateCart();
                $(this).fadeIn(fadeTime);
              });
            });
          }

          /* Remove item from cart */
          function removeItem(removeButton) {
            /* Remove row from DOM and recalc cart total */
            var productRow = $(removeButton).parent().parent();
            productRow.slideUp(fadeTime, function () {
              productRow.remove();
              recalculateCart();
            });
          }
          clearInterval(interval);
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