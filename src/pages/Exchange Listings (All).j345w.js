import * as ExchangeConstants from 'public/Constants/ExchangeConstants.js';
import * as ItemListSetupFunctions from 'public/ItemListSetup.js';

$w.onReady(function () {
	ItemListSetupFunctions.initialItemListSetup(ExchangeConstants.EXCHANGE_KEY);
});