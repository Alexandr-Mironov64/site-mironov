// Гараж №1 — интерактив: шапка, мобильное меню, форма обратного звонка (деморежим)
(function () {
  'use strict';

  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function onScroll() {
    header.classList.toggle('header--scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('nav--open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.classList.contains('nav__link')) {
      nav.classList.remove('nav--open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Форма (деморежим, заявка никуда не отправляется) ---------- */
  var form = document.getElementById('callback-form');
  var nameInput = document.getElementById('f-name');
  var phoneInput = document.getElementById('f-phone');
  var consent = document.getElementById('f-consent');
  var status = document.getElementById('form-status');
  var submit = form.querySelector('.form__submit');

  var errName = document.getElementById('err-name');
  var errPhone = document.getElementById('err-phone');
  var errConsent = document.getElementById('err-consent');

  // Лёгкая маска и нормализация телефона к +7XXXXXXXXXX
  phoneInput.addEventListener('input', function () {
    var digits = phoneInput.value.replace(/\D/g, '');
    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits.charAt(0) !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);
    var p = digits;
    var out = '+7';
    if (p.length > 1) out += ' (' + p.substr(1, 3);
    if (p.length >= 4) out += ') ' + p.substr(4, 3);
    if (p.length >= 7) out += '-' + p.substr(7, 2);
    if (p.length >= 9) out += '-' + p.substr(9, 2);
    phoneInput.value = out;
  });

  function showError(input, errEl, message) {
    if (message) { errEl.textContent = message; }
    errEl.hidden = false;
    input.classList.add('input--invalid');
  }
  function hideError(input, errEl) {
    errEl.hidden = true;
    input.classList.remove('input--invalid');
  }
  [nameInput, phoneInput].forEach(function (input) {
    input.addEventListener('input', function () {
      hideError(input, input === nameInput ? errName : errPhone);
      status.textContent = '';
    });
  });
  consent.addEventListener('change', function () {
    errConsent.hidden = true;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;

    if (nameInput.value.trim().length < 2) {
      showError(nameInput, errName, 'Укажите имя.');
      valid = false;
    } else {
      hideError(nameInput, errName);
    }

    var digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length !== 11) {
      showError(phoneInput, errPhone, 'Введите номер в формате +7 (XXX) XXX-XX-XX.');
      valid = false;
    } else {
      hideError(phoneInput, errPhone);
    }

    if (!consent.checked) {
      errConsent.hidden = false;
      valid = false;
    }

    if (!valid) return;

    submit.disabled = true;
    submit.textContent = 'Отправляем…';

    // Деморежим: имитация отправки без сети
    setTimeout(function () {
      submit.disabled = false;
      submit.textContent = 'Позвоните мне';
      status.className = 'form__status form__status--demo';
      status.textContent = 'Деморежим. Заявка не отправлена. Спасибо, ' + nameInput.value.trim() + '!';
      form.reset();
    }, 700);
  });
})();
