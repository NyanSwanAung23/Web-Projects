if (document.readyState == 'loading') {
	document.addEventListener('DOMContentLoaded', ready);
} else {
	ready();
}

/****************** Pop Up Modal ************************/
var modal = document.getElementById('myModal');
var length1, check, fname, fprice, fimg, tprice;

function show_modal() {
	document.getElementById('myModal').style.display = 'block';
}

// When the user clicks on <span> (x), close the modal
function close_modal() {
	document.getElementById('myModal').style.display = 'none';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
	if (event.target == modal) {
		modal.style.display = 'none';
	}
};

/****************** Cart functions***********************/
function ready() {
	autoAdd();
	setItems();

	var removeCartItemButtons = document.getElementsByClassName('btn-danger');
	for (var i = 0; i < removeCartItemButtons.length; i++) {
		var button = removeCartItemButtons[i];
		button.addEventListener('click', removeCartItems);
	}

	var quantityInputs = document.getElementsByClassName('cart-quantity-input');
	for (var i = 0; i < quantityInputs.length; i++) {
		var input = quantityInputs[i];
		input.addEventListener('change', quantityChanged);
	}

	var addToCartButtons = document.getElementsByClassName('addToCart_btn');
	for (var i = 0; i < addToCartButtons.length; i++) {
		var cart_btn = addToCartButtons[i];
		cart_btn.addEventListener('click', addToCartClicked);
	}

	var cancelButtons = document.getElementsByClassName('btn-cancelDelivery');
	for (var i = 0; i < cancelButtons.length; i++) {
		var cancelBtn = cancelButtons[i];
		cancelBtn.addEventListener('click', cancelDelivery);
	}
}

function purchaseClicked() {
	var cartItems = document.getElementsByClassName('cart-items')[0];
	while (cartItems.hasChildNodes()) {
		cartItems.removeChild(cartItems.firstChild);
	}
	updateCartTotal();
}
function removeCartItems(event) {
	var buttonClicked = event.target;
	var container = buttonClicked.parentElement.parentElement;
	container.remove(); /******** Removing from UI ********/

	/****************** Removing the selected item from local stroage**********************/
	var title = container.getElementsByClassName('cart-item-title')[0].innerText;
	var price = container.getElementsByClassName('cart-price')[0].innerText;
	var imgSrc = container.getElementsByClassName('cart-item-image')[0].src;
	getScript('https://cdnjs.cloudflare.com/ajax/libs/barn/0.2.3/barn.min.js', function() {
		var barn = new Barn(localStorage);
		var dummyTitle, dummySrc, dummyPrice;
		for (var a = 0; a < localStorage.getItem('length1'); a++) {
			dummyTitle = barn.rpop('foodname-global');
			dummySrc = barn.rpop('foodimg-global');
			dummyPrice = barn.rpop('foodprice-global');

			if (title == dummyTitle && imgSrc == dummySrc && price == dummyPrice) {
				console.log('matched');
				barn.lpush('removed-foodname', dummyTitle);
				barn.lpush('removed-foodprice', dummyPrice);
				barn.lpush('removed-foodimg', dummySrc);

				barn.lpush('removeDummyName', dummyTitle);

				showAlert(event); // show alert box with undo button and cancel button
				var dummyLength = localStorage.getItem('length1');
				dummyLength--;
				localStorage.setItem('length1', dummyLength);
			} else {
				barn.lpush('foodname-global', dummyTitle);
				barn.lpush('foodprice-global', dummyPrice);
				barn.lpush('foodimg-global', dummySrc);
			}
		}
	});

	updateCartTotal();
}
function quantityChanged(event) {
	var input = event.target;
	if (isNaN(input.value) || input.value <= 0) {
		// Validating quantity input
		input.value = 1;
	}
	var buttonClicked = event.target;
	var container = buttonClicked.parentElement.parentElement;
	updateCartTotal();
}
function addToCartClicked(event) {
	check = 1;
	var button = event.target;
	var container = button.parentElement.parentElement;
	console.log(container);

	var title = container.getElementsByClassName('food_name')[0].innerText;
	var price = container.getElementsByClassName('food_price')[0].innerText;
	var imageSrc = container.getElementsByClassName('food_image')[0].src;

	getScript('https://cdnjs.cloudflare.com/ajax/libs/barn/0.2.3/barn.min.js', function() {
		var barn = new Barn(localStorage);

		if (localStorage.getItem('restaurant-condition') != '1') {
			barn.lpush('foodname-global', title);
			barn.lpush('foodprice-global', price);
			barn.lpush('foodimg-global', imageSrc);

			addItemToCart(title, price, imageSrc);

			localStorage.setItem('restaurant-condition', 'checked');
		}
		updateCartTotal();
	});
}
function addItemToCart(title, price, imageSrc) {
	var check = 0;
	var cartRow = document.createElement('div');
	cartRow.classList.add('cart-row');

	var cartItems = document.getElementsByClassName('cart-items')[0];

	var cartItemNames = cartItems.getElementsByClassName('cart-item-title');

	for (var i = 0; i < cartItemNames.length; i++) {
		if (cartItemNames[i].innerText == title) {
			alert('This item is already added to the cart');
			return;
		}
	}
	if (check == 0) {
		alert('Item has added');
	}

	var cartRowContents = `
			<div class="cart-item cart-column">
			<img class="cart-item-image" src="${imageSrc}" width="100" height="100">
			<span class="cart-item-title" >${title}</span>
		</div>
		<span class="cart-price cart-column">${price}</span>
		<div class="cart-quantity cart-column">
			<input style = "cursor:not-allowed;" class="cart-quantity-input quantity-control" type="number" value="1">
			<button class="btn btn-danger" type="button">REMOVE</button>
		</div>`;
	cartRow.innerHTML = cartRowContents;
	cartItems.append(cartRow);
	getScript('https://cdnjs.cloudflare.com/ajax/libs/barn/0.2.3/barn.min.js', function() {
		var barn = new Barn(localStorage);
		length1 = barn.llen('foodname-global');
		localStorage.setItem('length1', length1);
	});

	cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItems);
	cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged);
}
function updateCartTotal() {
	var cartItemContainer0 = document.getElementsByClassName('cart-items')[0];
	var cartRows0 = cartItemContainer0.getElementsByClassName('cart-row');
	var Cashtotal0 = 0;
	var quantityTotal0 = 0;
	for (var i = 0; i < cartRows0.length; i++) {
		var cartRow0 = cartRows0[i];
		var priceElement0 = cartRow0.getElementsByClassName('cart-price')[0];
		var quantityElement0 = cartRow0.getElementsByClassName('cart-quantity-input')[0];
		var price0 = parseFloat(priceElement0.innerText.replace('MMK', ''));
		var quantity0 = quantityElement0.value;
		Cashtotal0 = Cashtotal0 + price0 * quantity0;
		quantityTotal0++;
	}
	Cashtotal0 = Math.round(Cashtotal0 * 100) / 100;
	var t0 = parseInt(Cashtotal0);

	var Cashtotal1 = 0,
		quantityTotal1 = 0,
		t1 = 0;
	if (localStorage.getItem('noti-tprice') == 'checked') {
		var cartItemContainer1 = document.getElementsByClassName('cart-items')[1];
		var cartRows1 = cartItemContainer1.getElementsByClassName('cart-row');
		Cashtotal1 = 0;
		quantityTotal1 = 0;
		for (var i = 0; i < cartRows1.length; i++) {
			var cartRow1 = cartRows1[i];
			var priceElement1 = cartRow1.getElementsByClassName('cart-price')[0];
			var quantityElement1 = cartRow1.getElementsByClassName('cart-quantity-input')[0];
			var price1 = parseFloat(priceElement1.innerText.replace('MMK', ''));
			var quantity1 = quantityElement1.value;
			Cashtotal1 = Cashtotal1 + price1 * quantity1;
			quantityTotal1++;
		}
		Cashtotal1 = Math.round(Cashtotal1 * 100) / 100;
		t1 = parseInt(Cashtotal1);
	}
	var t2 = t0 + t1;
	var q2 = 0;
	var userLocation = sessionStorage.getItem('user-location');
	var deliveryCharges = sessionStorage.getItem(userLocation);
	q2 = quantityTotal0 + quantityTotal1;

	var totalAmount = t2 + parseInt(deliveryCharges);
	document.getElementsByClassName('cart-total-price')[0].innerText = 'MMK ' + t2;
	document.getElementsByClassName('cart-total-price')[1].innerText = sessionStorage.getItem('user-location');
	document.getElementsByClassName('cart-total-price')[2].innerText = 'MMK ' + parseInt(deliveryCharges);
	document.getElementsByClassName('cart-total-price')[3].innerText = 'MMK ' + totalAmount;

	localStorage.setItem('total-foodprice-global', t2);
	localStorage.setItem('quantityTotal-global', q2);
}

/****************** Auto add functions ***********************/
function autoAddToCart(title, price, imageSrc) {
	var cartRow = document.createElement('div');
	cartRow.classList.add('cart-row');

	var cartItems = document.getElementsByClassName('cart-items')[1];
	var cartRowContents = `
	    <div class="cart-item cart-column">
	        <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
	        <span class="cart-item-title" >${title}</span>
	    </div>
	    <span class="cart-price cart-column">${price}</span>
	    <div class="cart-quantity cart-column">
	        <input class="cart-quantity-input" type="number" value="1">
	        <button class="btn btn-danger" type="button">REMOVE</button>
		</div>`;
	cartRow.innerHTML = cartRowContents;
	cartItems.append(cartRow);

	// localStorage.setItem('removeItem-con', 'unchecked');
	cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItems);
	cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged);
}
function autoAdd() {
	getScript('https://cdnjs.cloudflare.com/ajax/libs/barn/0.2.3/barn.min.js', function() {
		if (localStorage.getItem('restaurant-condition') == 'checked') {
			var barn2 = new Barn(localStorage);
			for (var a = 0; a < localStorage.getItem('length1'); a++) {
				fname = barn2.rpop('foodname-global');
				fprice = barn2.rpop('foodprice-global');
				fimg = barn2.rpop('foodimg-global');

				barn2.lpush('foodname-global', fname);
				barn2.lpush('foodprice-global', fprice);
				barn2.lpush('foodimg-global', fimg);

				autoAddToCart(fname, fprice, fimg);
				updateCartTotal();
			}
			document.getElementsByClassName('cart-total-price')[0].innerText =
				'MMK ' + localStorage.getItem('total-foodprice-global');
		}
	});
}
function getScript(url, callback) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	// most browsers
	script.onload = callback;
	// IE 6 & 7
	script.onreadystatechange = function() {
		if (this.readyState == 'complete') {
			callback();
		}
	};
	document.getElementsByTagName('head')[0].appendChild(script);
}
/****************** Text box validation ***********************/
function passValues() {
	var firstname = document.getElementById('tb1').value;
	var lastname = document.getElementById('tb2').value;
	var ph1 = document.getElementById('tb3').value;
	var ph2 = document.getElementById('tb4').value;
	var address = document.getElementById('tb5').value;
	var city = document.getElementById('tb6').value;
	var township = document.getElementById('tb7').value;
	var errormsg = '';

	if (localStorage.getItem('quantityTotal-global') == 0) {
		errormsg += 'Please add some food items to shopping cart \n';
	}
	if (firstname == '') {
		errormsg += 'Please Enter your First Name! \n';
		document.getElementById('tb1').style.borderColor = 'e63c60';
	}
	if (lastname == '') {
		errormsg += 'Please Enter your Last Name! \n';
		document.getElementById('tb2').style.borderColor = 'e63c60';
	}
	if (ph1 == '' && ph2 == '') {
		errormsg += 'Please Enter your Phone Number! \n';
		document.getElementById('tb3').style.borderColor = 'e63c60';
	}
	if (address == '') {
		errormsg += 'Please Enter your Address! \n';
		document.getElementById('tb5').style.borderColor = 'e63c60';
	}
	if (city == '') {
		errormsg += 'Please Enter your City! \n';
		document.getElementById('tb6').style.borderColor = 'e63c60';
	}
	if (township == '') {
		errormsg += 'Please Enter your Township! \n';
		document.getElementById('tb7').style.borderColor = 'e63c60';
	}
	if (errormsg != '') {
		alert(errormsg);
		return false;
	}
	if ((errormsg = true)) {
		alert('Thank You For Your Purchase');

		sessionStorage.setItem('Fname', firstname);
		sessionStorage.setItem('Lname', lastname);
		sessionStorage.setItem('Ph1', ph1);
		sessionStorage.setItem('Ph2', ph2);
		sessionStorage.setItem('SelectBox', selectedLocation);
		sessionStorage.setItem('Address', address);
		sessionStorage.setItem('City', city);
		sessionStorage.setItem('Township', township);

		document.getElementById('tb1').value = null;
		document.getElementById('tb2').value = null;
		document.getElementById('tb3').value = null;
		document.getElementById('tb4').value = null;
		document.getElementById('tb5').value = null;
		document.getElementById('tb6').value = null;
		document.getElementById('tb7').value = null;

		document.getElementById('tb1').style.borderColor = '#000';
		document.getElementById('tb2').style.borderColor = '#000';
		document.getElementById('tb3').style.borderColor = '#000';
		document.getElementById('tb4').style.borderColor = '#000';
		document.getElementById('tb5').style.borderColor = '#000';
		document.getElementById('tb6').style.borderColor = '#000';
		document.getElementById('tb7').style.borderColor = '#000';
		location.href = 'personal_info.html';
	}
}

var AlertBox = function(id, option) {
	this.show = function() {
		var alertArea = document.querySelector(id);
		var alertBox = document.createElement('DIV');
		var alertContent = document.createElement('DIV');
		var alertClose = document.createElement('A');
		var alertClass = this;

		var barn = new Barn(localStorage);
		var dummy = barn.lpop('removeDummyName');
		var buttonContent =
			`You have removed <span class = 'removeTxt'> ` +
			dummy +
			`</span>` +
			` <br><br>
	<button class = 'undoBtn'>Undo</button> <button class= 'cancelBtn' onclick = "alertClass.hide(alertBox);">Cancel</button>`;

		alertContent.classList.add('alert-content');

		alertContent.innerHTML = buttonContent;

		alertClose.classList.add('alert-close');
		alertClose.setAttribute('href', '#');
		alertBox.classList.add('alert-box');
		alertBox.appendChild(alertContent);
		if (!option.hideCloseButton || typeof option.hideCloseButton === 'undefined') {
			alertBox.appendChild(alertClose);
		}
		alertArea.appendChild(alertBox);
		alertClose.addEventListener('click', function(event) {
			event.preventDefault();
			alertClass.hide(alertBox);
		});
	};

	this.hide = function(alertBox) {
		alertBox.classList.add('hide');
		var disperseTimeout = setTimeout(function() {
			alertBox.parentNode.removeChild(alertBox);
			clearTimeout(disperseTimeout);
		}, 500);
	};
};

var alertPersistent = document.querySelector('#alertPersistent');
var alertHiddenClose = document.querySelector('#alertHiddenClose');

var alertbox = new AlertBox('#alert-area', {
	closeTime: 5000,
	persistent: false,
	hideCloseButton: false
});
var alertboxPersistent = new AlertBox('#alert-area', {
	closeTime: 5000,
	persistent: true,
	hideCloseButton: false
});
var alertNoClose = new AlertBox('#alert-area', {
	closeTime: 5000,
	persistent: false,
	hideCloseButton: true
});

function showAlert(event) {
	alertboxPersistent.show('');
	readyRemove();
}
function readyRemove() {
	getScript('https://cdnjs.cloudflare.com/ajax/libs/barn/0.2.3/barn.min.js', function() {
		var barn = new Barn(localStorage);
		removedLength = barn.llen('removed-foodname');
		localStorage.setItem('removedLength', removedLength);
	});

	// add event listener to cancel buttons
	var undoButtons = document.getElementsByClassName('undoBtn');
	for (var i = 0; i < undoButtons.length; i++) {
		var undo_btn = undoButtons[i];
		undo_btn.addEventListener('click', pushRemovedItems);
	}
	var cancelButtons = document.getElementsByClassName('cancelBtn');
	for (var i = 0; i < cancelButtons.length; i++) {
		var cancel_btn = cancelButtons[i];
		cancel_btn.addEventListener('click', removeAlertBox);
	}
}
function removeAlertBox(event) {
	var cancelBtn = event.target;
	var container = cancelBtn.parentElement.parentElement;
	var dummyLength = localStorage.getItem('removedLength');
	dummyLength--;
	localStorage.setItem('removedLength', dummyLength);
	container.remove();
}
function pushRemovedItems(event) {
	// add the removed items back to the shopping cart

	getScript('https://cdnjs.cloudflare.com/ajax/libs/barn/0.2.3/barn.min.js', function() {
		var barn = new Barn(localStorage);
		var dummyRemovedTitle, dummyRemovedSrc, dummyRemovedPrice, dummyLength;
		var undoBtn = event.target;
		var container = undoBtn.parentElement.parentElement;
		var selectedItem = container.getElementsByClassName('removeTxt')[0].innerText;
		container.remove();

		for (var x = 0; x < localStorage.getItem('removedLength'); x++) {
			dummyRemovedTitle = barn.rpop('removed-foodname');
			dummyRemovedPrice = barn.rpop('removed-foodprice');
			dummyRemovedSrc = barn.rpop('removed-foodimg');

			if (selectedItem == dummyRemovedTitle) {
				console.log('item matched');
				dummyLength = localStorage.getItem('removedLength');
				dummyLength--;
				localStorage.setItem('removedLength', dummyLength);

				barn.lpush('foodname-global', dummyRemovedTitle);
				barn.lpush('foodprice-global', dummyRemovedPrice);
				barn.lpush('foodimg-global', dummyRemovedSrc);
				addItemToCart(dummyRemovedTitle, dummyRemovedPrice, dummyRemovedSrc);
				updateCartTotal();

				break;
			} else {
				barn.lpush('removed-foodname', dummyRemovedTitle);
				barn.lpush('removed-foodprice', dummyRemovedPrice);
				barn.lpush('removed-foodimg', dummyRemovedSrc);
			}
		}
	});
}

function setItems() {
	// set loaction and each location's delivery charges in sessionStorage

	sessionStorage.setItem('BurgerKing-location', 'Insein');
	sessionStorage.setItem('McDonalds-location', 'Dagon');
	sessionStorage.setItem('Arbys-location', 'SanChaung');
	sessionStorage.setItem('Subway-location', 'Kamayut');
	sessionStorage.setItem('Insein', '2500');
	sessionStorage.setItem('Dagon', '3000');
	sessionStorage.setItem('SanChaung', '3500');
	sessionStorage.setItem('Kamayut', '2000');
}
function cancelDelivery(event) {
	close_modal();
	alert('Thank you for using our website');
	localStorage.clear();
	sessionStorage.clear();
	location.href = 'home.html';
}