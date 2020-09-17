/* eslint-disable no-undef */
const handler = StripeCheckout.configure({
  key: 'pk_test_iVqxe0DfqJNxiBtlRvneQHXT',
  locale: 'auto',
  token(token) {
    const stripeToken = token.id;
    const billingCardLast4 = token.card.last4;
    const billingCardExpMonth = String(token.card.exp_month);
    const billingCardExpYear = String(token.card.exp_year);
    $.post('/saveCard', { stripeToken, billingCardLast4, billingCardExpMonth, billingCardExpYear }, _ => {
      window.location.reload();
    });
  },
});

document.getElementById('addCard').addEventListener('click', e => {
  // Open Checkout with further options:
  const reqEmail = $('#email').val();
  handler.open({
    name: 'Druid',
    description: 'Link your credit card.',
    panelLabel: 'Save card',
    email: reqEmail,
    locale: 'auto',
    zipCode: false,
    allowRememberMe: false,
  });
  e.preventDefault();
});
