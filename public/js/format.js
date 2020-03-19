exports.getUsCurrency = function currencyFormat(number) {
  let formattedNumber = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format((number));
  return formattedNumber;
};
