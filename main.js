// global variables
var _products = [];

// helper functions
function $(selector){
  var selectorFlag = selector[0];
  var selectorId = selector.slice(1);
  if (selectorFlag == '.') {
    return document.getElementsByClassName(selectorId);
  }
  return document.getElementById(selectorId); 
}

function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
  function(m,key,value) {
    vars[key] = value;
  });
  return vars;
}

function updateUrl(param_name, value) {
  var query = '';
  var params = getUrlVars();
  params[param_name] = value;
  
  for(var key in params) {
    query += key+'='+params[key]+'&';
  }
  return location.href.split('?')[0]  + '?' + query;
}

function loadJSON(path, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(JSON.parse(xhr.responseText));
      } else {
        if (error)
          error(xhr);
      }
    }
  };
  xhr.open('GET', path, true);
  xhr.send();
}

// controller functions
function clickProduct(event) {
    // update URI
    var id = event.target.getAttribute('data-product-id');
    if (id === null) return;
    history.pushState('', 'Teespring: Product ' + id, updateUrl('id', id));
    selectProduct();
    event.preventDefault();
}

// UI functions 
function selectProduct() {
  var selectedId = getUrlVars()['id'] ? getUrlVars()['id'] : '1';
  var products = document.getElementsByClassName('product');
  for (var i = 0; i<products.length; i++) {
    products[i].classList.remove('selected');

    if (products[i].firstChild.getAttribute('data-product-id') == selectedId) {
      products[i].className += ' selected';

      // slide selected thumbnail to 70px from left
      var productsOffset = $('#products').style.left ? parseInt($('#products').style.left) : 0;
      var offset = 70 - getOffsetRect(products[i]).left + productsOffset;
      $('#products').style.left = offset + "px"; 
    }
  }

  for (var i in _products) {
    if (_products[i].id == selectedId) {
      $('#product-image').src = _products[i].product_image_url;
      $('#product-title').innerHTML = _products[i].id + ". " + _products[i].title;
      break;
    }
  }
}

function renderSelectorProduct(product) {
  return "<li class='product'>" + 
    "<a data-product-id='" + product.id + "' class='thumbnail' href='#'></a>" +
    "<span>" + product.id + "</span></li>";
}

function renderView(data) {
  var productsEl = document.getElementById('products');
  productsEl.addEventListener('click', clickProduct);
  for (i in _products) {
    productsEl.innerHTML += renderSelectorProduct(_products[i]);
  }
  selectProduct();
}

function getOffsetRect(elem) {
  // this accounts for margin and border widths of element
  var box = elem.getBoundingClientRect();
  var body = document.body;
  var docElem = document.documentElement;
  
  // get scrollTop, and give fallback options for sad browsers
  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
  
  // get shift if any, 0 if not
  var clientTop = docElem.clientTop || body.clientTop || 0;
  var clientLeft = docElem.clientLeft || body.clientLeft || 0;
  
  // calculate
  var top  = box.top +  scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;
  
  return { top: Math.round(top), left: Math.round(left) }
}

// main app, wait for DOM content to load
document.addEventListener('DOMContentLoaded', function(event) {
  loadJSON(
    'products.json',
    function(data) { _products = data; renderView(); },
    function(xhr)  { console.error(xhr); }
  );
});

// catch browser back/forward
window.onpopstate = selectProduct;

