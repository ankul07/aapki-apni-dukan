// utils/getDevices.js

/**
 * Detects browser name from user agent
 */
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";

  if (userAgent.indexOf("Firefox") > -1) {
    browserName = "Firefox";
  } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    browserName = "Opera";
  } else if (userAgent.indexOf("Trident") > -1) {
    browserName = "Internet Explorer";
  } else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) {
    browserName = "Edge";
  } else if (userAgent.indexOf("Chrome") > -1) {
    browserName = "Chrome";
  } else if (userAgent.indexOf("Safari") > -1) {
    browserName = "Safari";
  }

  return browserName;
};

/**
 * Detects platform/OS from user agent
 */
const getPlatformInfo = () => {
  const userAgent = navigator.userAgent;
  let platform = "Unknown";

  if (userAgent.indexOf("Win") > -1) {
    platform = "Windows";
  } else if (userAgent.indexOf("Mac") > -1) {
    platform = "MacOS";
  } else if (userAgent.indexOf("Linux") > -1) {
    platform = "Linux";
  } else if (userAgent.indexOf("Android") > -1) {
    platform = "Android";
  } else if (
    userAgent.indexOf("iPhone") > -1 ||
    userAgent.indexOf("iPad") > -1
  ) {
    platform = "iOS";
  }

  return platform;
};

/**
 * Generates device name based on browser and platform
 */
const getDeviceName = () => {
  const browser = getBrowserInfo();
  const platform = getPlatformInfo();
  return `${browser} on ${platform}`;
};

/**
 * Gets or creates a unique device ID
 */
export const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    const randomId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    deviceId = `${navigator.platform}-${randomId}-${Date.now()}`;
    localStorage.setItem("deviceId", deviceId);
  }

  return deviceId;
};

/**
 * Gets complete device information (matches your MongoDB model)
 * @returns {Object} Complete device information
 */
export const getDeviceInfo = () => {
  return {
    deviceId: getDeviceId(),
    deviceName: getDeviceName(),
    userAgent: navigator.userAgent,
    platform: getPlatformInfo(),
    browser: getBrowserInfo(),
    lastUsed: new Date(),
    isActive: true,
  };
};
