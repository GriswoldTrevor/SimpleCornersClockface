import { display } from "display";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import * as messaging from "messaging";
import { battery } from "power";
import { today } from "user-activity";
import { preferences, units } from "user-settings";

import * as util from "../common/utils";

//Setup handles for commonly used UI elements 
let dateElement = null;
let timeElement = null;
let powerElement = null;
let heartRateElement = null;
let stepElement = null;
let distanceIcon = null;
let distanceElement = null;
let activeMinuteIcon = null;
let activeMinuteElement = null;
let stairIcon = null;
let stairElement = null;
let calorieIcon = null;
let calorieElement = null;

//Heart rate sensor and variables to track last reading
let heartRateSensor = null;
let lastHeartRateReadingTime = null;
let lastHeartRateReadingNum = null;

//Counter to track which sensor to show in the bottom right corner
let otherSensorNumber = null;

//Continually used settings
let setting24HourTime = null;
let settingDistanceIsMetric = null;

export function initClockface(savedSettings) {
  //Get handles for the UI elements
  dateElement = document.getElementById("dateText");
  timeElement = document.getElementById("timeText");
  powerElement = document.getElementById("powerText");
  heartRateElement = document.getElementById("heartRateText");
  stepElement = document.getElementById("stepText");
  distanceIcon = document.getElementById("distanceIcon");
  distanceElement = document.getElementById("distanceText");
  activeMinuteIcon = document.getElementById("activeMinuteIcon");
  activeMinuteElement = document.getElementById("activeMinuteText");
  stairIcon = document.getElementById("stairIcon");
  stairElement = document.getElementById("stairText");
  calorieIcon = document.getElementById("calorieIcon");
  calorieElement = document.getElementById("calorieText");
  
  //Configure the clockface to toggle the sensor displayed in the bottom right when tapped
  otherSensorNumber = 0;
  const clockfaceElement = document.getElementById("clockface");
  clockfaceElement.onclick = () => {
    otherSensorNumber = (otherSensorNumber + 1) % 4;
    updateOtherStatElements();
  };
  
  //Start the heartrate sensor
  lastHeartRateReadingTime = null;
  lastHeartRateReadingNum = null;
  heartRateSensor = new HeartRateSensor({ frequency: 1 }); //frequency in Hz
  heartRateSensor.start();
  
  display.onchange = function() {
    if (heartRateSensor !== null) {
      if (display.on)
        heartRateSensor.start();
      else
        heartRateSensor.stop(); 
    }
  };
 
  //Initialize the settings
  loadSettings(savedSettings);
  
  //Make sure to start with a filled clockface
  updateClockface();
}

export function updateClockface() {
  updateTimeElement();
  updateDateElement();
  updateStepElement();
  updatePowerElement();
  updateHeartRateElement();
  
  updateOtherStatElements();
}

export function loadSettings(savedSettings) {
  //Load any saved settings from the filesystem
  const settings = parseSettings(savedSettings);
  
  setting24HourTime = settings["use24HourTime"];
  settingDistanceIsMetric = settings["useMetricDistance"];
  const useIconColorForCornerText = settings["useIconColorForCornerText"];
  const backgroundColor = settings["backgroundColor"];
  const iconColor = settings["iconColor"];
  const textColor = settings["textColor"];
  
  colorizeElements(backgroundColor, iconColor, textColor, useIconColorForCornerText);
}

function parseSettings(savedSettings) {
  //Initialize with default settings
  let settings = {};
  settings["use24HourTime"] = preferences.clockDisplay === "24h";
  settings["useMetricDistance"] = units.distance === "metric";
  settings["useIconColorForCornerText"] = false;
  settings["backgroundColor"] = "#000000";
  settings["textColor"] = "#FFFFFF";
  settings["iconColor"] = "#FFFFFF";
  
  //Load saved settings
  for (const key in savedSettings) {
    if (savedSettings[key] !== null && savedSettings[key] !== undefined) {
      if (key === "use24HourTime" || key === "useMetricDistance" || key === "useIconColorForCornerText") { //Bool
        settings[key] = savedSettings[key]; 
      } else if (key === "backgroundColor" || key === "iconColor" || key === "textColor") { //Color
        if (util.isValidHexColor(savedSettings[key]))
          settings[key] = savedSettings[key].trim();
      }
    }
  }
  
  return settings;
}

function colorizeElements(backgroundColor, iconColor, textColor, useIconColorForCornerText) {
  const backgroundElements = [document.getElementById("background")];
  let iconElements = document.getElementsByClassName("icon");
  let textElements = document.getElementsByClassName("centerText");
  const cornerTextElements = document.getElementsByClassName("statText");
  
  if (useIconColorForCornerText)
    iconElements = iconElements.concat(cornerTextElements);
  else
    textElements = textElements.concat(cornerTextElements);
  
  util.colorizeElements(backgroundElements, backgroundColor);
  util.colorizeElements(iconElements, iconColor);
  util.colorizeElements(textElements, textColor);
}

function updateOtherStatElements() {
  let elementsToShow = [];
  
  //Other stats: 0: Distance, 1: Active Minutes, 2: Stairs, 3: Calories
  if (otherSensorNumber === 3) {
    updateCalorieElement();
    elementsToShow = [calorieElement, calorieIcon];
  } else if (otherSensorNumber === 2) {
    updateStairElement();
    elementsToShow = [stairElement, stairIcon];
  } else if (otherSensorNumber === 1) {
    updateActiveMinuteElement();
    elementsToShow = [activeMinuteElement, activeMinuteIcon];
  } else {
    updateDistanceElement();
    elementsToShow = [distanceElement, distanceIcon];
  }
  
  //Hide all bottom right elements
  util.hideElements([calorieElement, calorieIcon, activeMinuteElement, activeMinuteIcon, distanceElement, distanceIcon, stairElement, stairIcon]);
  util.showElements(elementsToShow);
}

function updatePowerElement() {
  const batteryLevel = Math.floor(battery.chargeLevel);
  
  const powerText = util.convertToMonospaceDigits(batteryLevel + "%");
  powerElement.text = `${powerText}`;
}

function updateStairElement() {
  const elevationGain = (today.adjusted.elevationGain !== undefined) ? today.adjusted.elevationGain : 0;
  
  const stairText = util.convertToMonospaceDigits(elevationGain);
  stairElement.text = `${stairText}`;
}

function updateDistanceElement() {
  let distance = (today.adjusted.distance !== undefined) ? today.adjusted.distance : 0;
  
  if (settingDistanceIsMetric)
    distance = distance * 0.001;
  else
    distance = distance * 0.000621371;
  
  const distanceText = util.convertToMonospaceDigits(distance.toFixed(2));
  distanceElement.text = `${distanceText}`;
}

function updateActiveMinuteElement() {
  const activeMinutes = (today.adjusted.activeMinutes !== undefined) ? today.adjusted.activeMinutes : 0;
  
  const activeMinuteText = util.convertToMonospaceDigits(activeMinutes);
  activeMinuteElement.text = `${activeMinuteText}`;
}

function updateCalorieElement() {
  const calories = (today.adjusted.calories !== undefined) ? today.adjusted.calories : 0;
  
  const calorieText = util.convertToMonospaceDigits(calories);
  calorieElement.text = `${calorieText}`;
}

function updateHeartRateElement() {
  let heartRate = heartRateSensor.heartRate;
  if (heartRate !== null) {
    if (lastHeartRateReadingNum !== heartRateSensor.timestamp) {
      lastHeartRateReadingNum = heartRateSensor.timestamp;
      lastHeartRateReadingTime = new Date();
    } else if (((new Date()) - lastHeartRateReadingTime) > (3 * 1000)) //3 seconds since last reading
      heartRate = null;
  }
  
  const heartRateText = heartRate !== null ? util.convertToMonospaceDigits(heartRate) : "--";
  heartRateElement.text = `${heartRateText}`;
}

function updateStepElement() {
  const steps = (today.adjusted.steps !== undefined) ? today.adjusted.steps : 0;
  
  const stepText = util.convertToMonospaceDigits(steps);
  stepElement.text = `${stepText}`;
}

function updateTimeElement() {
  const time = new Date();
  let timeHours = time.getHours();
  const timeMins = time.getMinutes();
  
  if (!setting24HourTime) {
    if (timeHours == 0) {
      timeHours = 12;
    } else if (timeHours > 12) {
      timeHours = timeHours - 12;
    }
  }
  
  const timeText = util.convertToMonospaceDigits(util.zeroPadNumber(timeHours) + " " + util.zeroPadNumber(timeMins));
  timeElement.text = `${timeText}`;
}

function updateDateElement() {
  const date = new Date();
  const dateDay = util.getDayText(date.getDay());
  const dateMonth = util.getShortMonthText(date.getMonth());
  const dateDate = date.getDate();
  
  const dateText = dateDay.toUpperCase() + " " + dateMonth.toUpperCase() + " " + util.convertToMonospaceDigits(dateDate);
  dateElement.text = `${dateText}`;
}