import wixData from 'wix-data';
import * as ItemListSetupFunctions from 'public/ItemListSetup.js';
import * as GeneralFunctions from 'public/General.js';
import * as CapstoneChallengeConstants from 'public/Constants/CapstoneChallengeConstants.js';
import * as CustomizationConstants from 'public/Constants/CustomizationConstants.js';
import * as ConsumablesConstants from 'public/Constants/ConsumablesConstants.js';

let eightDayChallenges = ["Hello World"]; // A list of Challenge names that lasted for 8 days instead of 7 (currently just the S1 Week 1 Challenge).

$w.onReady(function () {
	// Set up the name filter.
	ItemListSetupFunctions.initialItemListSetup(CapstoneChallengeConstants.CAPSTONE_CHALLENGE_KEY);

	// Populate the data for each Capstone Challenge.
	$w("#listRepeater").onItemReady(async ($item, itemData) => {
		$item("#effectVideoPlayer").collapse();
		$item("#effectVideoPlayer").hide();

		let ultimateChallenge = itemData;
		$item("#ultimateChallengeDescription").text = ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_DESCRIPTION_FIELD] + " - " +
			ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_COMPLETION_THRESHOLD_FIELD];

		// Now that we have our current Ultimate Challenge, we need to grab the reward by using the fieldsWithItems field.
		let categoryWithItems = "";
		if (ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_FIELDS_WITH_ITEMS_FIELD].length > 0) {
			categoryWithItems = ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_FIELDS_WITH_ITEMS_FIELD][0]; // We're just going to grab the first category and item for now.
			let queryResults = await wixData.queryReferenced(CapstoneChallengeConstants.CAPSTONE_CHALLENGE_DB, ultimateChallenge._id, categoryWithItems);
			if (queryResults.items.length > 0) {
				ultimateChallenge[categoryWithItems] = queryResults.items; // Save the child items we just got to our rank item.
			}
		} 
		else {
			console.error("No reward categories found for this capstone challenge: " + ultimateChallenge);
			return;
		}

		const CUSTOMIZATION_CATEGORY = CustomizationConstants.CAPSTONE_CHALLENGE_ITEM_FIELD_TO_CUSTOMIZATION_CATEGORY_DICT[categoryWithItems];

		if (ultimateChallenge[categoryWithItems].length > 0) {
			let childItem = ultimateChallenge[categoryWithItems][0];

			let challengeHasMultipleRewards = false;

			if (ultimateChallenge[categoryWithItems].length > 1 || ultimateChallenge[categoryWithItems][0].length > 1)
			{
				// If we have multiple categories or multiple items in a category.
				challengeHasMultipleRewards = true;
			}

			if (CUSTOMIZATION_CATEGORY !== ConsumablesConstants.CONSUMABLES_KEY)
			{
				// We need to retrieve the customization type. Soon will do this for all items including attachments.
				const SOCKET_DB = CustomizationConstants.CUSTOMIZATION_CATEGORY_SPECIFIC_VARS[CUSTOMIZATION_CATEGORY].SocketDb;
				const CUSTOMIZATION_TYPE_REFERENCE_FIELD = CustomizationConstants.CUSTOMIZATION_CATEGORY_SPECIFIC_VARS[CUSTOMIZATION_CATEGORY].CustomizationSocketReferenceField;
				const SOCKET_NAME_FIELD = CustomizationConstants.CUSTOMIZATION_CATEGORY_SPECIFIC_VARS[CUSTOMIZATION_CATEGORY].SocketNameField;

				let customizationTypeResults = await wixData.query(SOCKET_DB)
					.eq("_id", childItem[CUSTOMIZATION_TYPE_REFERENCE_FIELD])
					.find();

				let childItemCustomizationType = customizationTypeResults.items[0][SOCKET_NAME_FIELD];

				const CUSTOMIZATION_IMAGE_FIELD = CustomizationConstants.CUSTOMIZATION_CATEGORY_SPECIFIC_VARS[CUSTOMIZATION_CATEGORY].CustomizationImageField;
				const CUSTOMIZATION_NAME_FIELD = CustomizationConstants.CUSTOMIZATION_CATEGORY_SPECIFIC_VARS[CUSTOMIZATION_CATEGORY].CustomizationNameField;

				//$item("#ultimateChallengeButton").link = childItem[CUSTOMIZATION_URL_FIELD];
				$item("#ultimateChallengeImage").src = childItem[CUSTOMIZATION_IMAGE_FIELD];
				$item("#ultimateChallengeImage").fitMode = "fit";
				$item("#ultimateChallengeRewardText").text = (challengeHasMultipleRewards) ? "Multiple rewards. Click here to see all." 
					: (childItem[CUSTOMIZATION_NAME_FIELD] + " " + childItemCustomizationType);

				if ("CustomizationEffectVideoField" in CustomizationConstants.CUSTOMIZATION_CATEGORY_SPECIFIC_VARS[CUSTOMIZATION_CATEGORY] &&
					childItem[CustomizationConstants.CUSTOMIZATION_CATEGORY_SPECIFIC_VARS[CUSTOMIZATION_CATEGORY].CustomizationEffectVideoField]) {

					$item("#effectVideoPlayer").src = childItem[CustomizationConstants.CUSTOMIZATION_CATEGORY_SPECIFIC_VARS[CUSTOMIZATION_CATEGORY].CustomizationEffectVideoField];

					console.log("Showing video and hiding image.");

					$item("#ultimateChallengeImage").collapse();
					$item("#ultimateChallengeImage").hide();
					$item("#effectVideoPlayer").expand();
					$item("#effectVideoPlayer").show();
				}
			}
			else
			{
				const CONSUMABLE_IMAGE_FIELD = ConsumablesConstants.CONSUMABLES_IMAGE_FIELD;
				const CONSUMABLE_NAME_FIELD = ConsumablesConstants.CONSUMABLES_NAME_FIELD;

				let consumableCount = 0;

				switch (childItem[CONSUMABLE_NAME_FIELD])
				{
					case ConsumablesConstants.CONSUMABLES_SPARTAN_POINTS_NAME:
						consumableCount = itemData[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_NUMBER_OF_SPARTAN_POINTS_FIELD];
						break;
					case ConsumablesConstants.CONSUMABLES_CHALLENGE_SWAP_NAME:
						consumableCount = itemData[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_NUMBER_OF_CHALLENGE_SWAPS_FIELD];
						break;
					case ConsumablesConstants.CONSUMABLES_CREDITS_NAME:
						consumableCount = itemData[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_NUMBER_OF_CREDITS_FIELD];
						break;
					case ConsumablesConstants.CONSUMABLES_XP_BOOST_NAME:
						consumableCount = itemData[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_NUMBER_OF_XP_BOOSTS_FIELD];
						break;
					case ConsumablesConstants.CONSUMABLES_XP_GRANT_NAME:
						consumableCount = itemData[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_NUMBER_OF_XP_GRANTS_FIELD];
						break;
					default:
						consumableCount = 0;
						break;
				}
				$item("#ultimateChallengeImage").src = childItem[CONSUMABLE_IMAGE_FIELD];
				$item("#ultimateChallengeImage").fitMode = "fit";
				$item("#ultimateChallengeRewardText").text = (challengeHasMultipleRewards) ? "Multiple rewards. Click here to see all." 
					: (childItem[CONSUMABLE_NAME_FIELD] + " x" + consumableCount);

			}

			let lastAvailableDatetime;

			if (ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_AVAILABLE_DATE_ARRAY_FIELD].length > 1 &&
				ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_CURRENTLY_AVAILABLE_FIELD]) {
				// The challenge is available this week and was available in a previous week.
				lastAvailableDatetime = new Date(ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_AVAILABLE_DATE_ARRAY_FIELD][1]);
				// We know it's available this week, so we're interested in its last availability.
			}
			else if (ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_CURRENTLY_AVAILABLE_FIELD]) {
				// The challenge is available for the first time this week. Hide the textbox by making the datetime null.
				lastAvailableDatetime = null;
			}
			else {
				// The challenge was available in a previous week.
				lastAvailableDatetime = new Date(ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_AVAILABLE_DATE_ARRAY_FIELD][0]);
			}

			if (lastAvailableDatetime) {
				let endAvailableDatetime = new Date(lastAvailableDatetime);
				endAvailableDatetime.setDate(lastAvailableDatetime.getDate() + 
					((eightDayChallenges.includes(ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_NAME_FIELD]) ? 8 : 7)));

				let lastAvailableString = GeneralFunctions.getLongMonthDayYearFromDate(lastAvailableDatetime);
				let endAvailableString = GeneralFunctions.getLongMonthDayYearFromDate(endAvailableDatetime);
				$item("#ultimateChallengeLastAvailableDatetimeText").text = "Last Available: " + lastAvailableString + " - " + endAvailableString;
			}
			else {
				// We don't have a last available datetime. Hide the textbox.
				$item("#ultimateChallengeLastAvailableDatetimeText").hide();
			}

			let seasonNum = -1, weekNum = -1;

			if (ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_AVAILABLE_SEASON_ARRAY_FIELD].length > 0) {
				seasonNum = ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_AVAILABLE_SEASON_ARRAY_FIELD][0]; // We want the most recent Season Num available.
			}

			if (ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_AVAILABLE_WEEK_ARRAY_FIELD].length > 0) {
				weekNum = ultimateChallenge[CapstoneChallengeConstants.CAPSTONE_CHALLENGE_AVAILABLE_WEEK_ARRAY_FIELD][0]; // We want the most recent Week Num available.
			}

			if (seasonNum > 1000) {
				let seasonOperation = seasonNum % 10;
				seasonNum = Math.floor(seasonNum / 1000);
				$item("#ultimateChallengeSeasonAndWeek").text = "Season " + seasonNum + "." + seasonOperation + ", Week " + weekNum;
			}
			else {
				$item("#ultimateChallengeSeasonAndWeek").text = "Season " + seasonNum + ", Week " + weekNum;
			}
		}
		else {
			console.error("No rewards found for this capstone challenge: " + ultimateChallenge);
		}
	});
});