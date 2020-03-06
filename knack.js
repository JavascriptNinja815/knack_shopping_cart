const app_id = Knack.app.id;
const api_key = 'f9b2e440-4f75-11ea-9358-cff65e062c5b';

const headers = {
  "X-Knack-Application-ID": app_id,
  "X-Knack-REST-API-Key": api_key
};

var taxRate = 0.05;
var shippingRate = 15.00;
var fadeTime = 300;

$(document).on('knack-form-submit.view_86', function (event, view, record) {
  
});

$(document).on('knack-form-submit.view_86', function (event, view, record) {
  var qty = $('#view_86-field_83').value;

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
      var price = parseFloat(res.field_9_raw); // price
      var productPrice = price * qty; // product price

      var subtotal = productPrice;
      var tax = subtotal * taxRate;
      var shipping = (subtotal > 0 ? shippingRate : 0);
      var total = subtotal + tax + shipping;

      var interval = setInterval(customCartPage, 1000);

      function customCartPage() {
        var timer = 0;
        if ($('#view_87 > form')) {
          clearInterval(interval);
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
              \
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
              <div class="totals">\
                <div class="totals-item">\
                  <label>Subtotal</label>\
                  <div class="totals-value" id="cart-subtotal">' + subtotal.toFixed(2) + '</div>\
                </div>\
                <div class="totals-item">\
                  <label>Tax (5%)</label>\
                  <div class="totals-value" id="cart-tax">' + tax.toFixed(2) + '</div>\
                </div>\
                <div class="totals-item">\
                  <label>Shipping</label>\
                  <div class="totals-value" id="cart-shipping">' + shipping.toFixed(2) + '</div>\
                </div>\
                <div class="totals-item totals-item-total">\
                  <label>Grand Total</label>\
                  <div class="totals-value" id="cart-total">' + total.toFixed(2) + '</div>\
                </div>\
              </div>\
            </div>\
          ');

          $('.product-quantity input').change(function () {
            updateQuantity(this);
          });

          $('.product-removal button').click(function () {
            removeItem(this);
          });

          /* Recalculate cart */
          function recalculateCart() {
            var subtotal = 0;

            /* Sum up row totals */
            $('.product').each(function () {
              subtotal += parseFloat($(this).children('.product-line-price').text());
            });

            /* Calculate totals */
            var tax = subtotal * taxRate;
            var shipping = (subtotal > 0 ? shippingRate : 0);
            var total = subtotal + tax + shipping;

            /* Update totals display */
            $('.totals-value').fadeOut(fadeTime, function () {
              $('#cart-subtotal').html(subtotal.toFixed(2));
              $('#cart-tax').html(tax.toFixed(2));
              $('#cart-shipping').html(shipping.toFixed(2));
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