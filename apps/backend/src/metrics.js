'use strict';

const { metrics } = require('@opentelemetry/api');

const meter = metrics.getMeter('cloudstore-backend', '1.0.0');

const ordersCounter = meter.createCounter('cloudstore_orders_total', {
  description: 'Total number of orders placed',
});

const productsViewedCounter = meter.createCounter('cloudstore_products_viewed_total', {
  description: 'Total number of product views',
});

const cartItemsHistogram = meter.createHistogram('cloudstore_cart_items', {
  description: 'Number of items in cart when order placed',
});

const orderValueHistogram = meter.createHistogram('cloudstore_order_value_dollars', {
  description: 'Order value in dollars',
});

module.exports = {
  ordersCounter,
  productsViewedCounter,
  cartItemsHistogram,
  orderValueHistogram,
};