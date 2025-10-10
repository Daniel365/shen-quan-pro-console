// 定义解析结果的接口类型
interface UAParsedResult {
  browser: string;
  browserVersion: string;
  os: string;
  architecture: "64-bit" | "32-bit";
}

/** 格式化UA系统信息 */
export function getParseUA(val: string): UAParsedResult {
  const result: UAParsedResult = {
    architecture: "32-bit",
    browser: "Unknown",
    browserVersion: "Unknown",
    os: "Unknown",
  };

  // 提取浏览器信息
  const browserMatch = val.match(
    /(Chrome|Safari|Firefox|Edge|Opera)\/(\d+\.\d+\.\d+\.\d+|\d+\.\d+)/
  );
  if (browserMatch) {
    result.browser = browserMatch[1];
    result.browserVersion = browserMatch[2];
  }

  // 提取操作系统信息
  if (val.includes("Windows NT 10.0")) {
    result.os = "Windows 10";
  } else if (val.includes("Windows NT 11.0")) {
    result.os = "Windows 11";
  } else if (val.includes("Windows NT 6.")) {
    result.os = "Windows 7/8/8.1";
  } else if (val.includes("Mac OS X")) {
    result.os = "macOS";
  } else if (val.includes("Linux")) {
    result.os = "Linux";
  } else if (val.includes("Android")) {
    result.os = "Android";
  } else if (val.includes("iOS")) {
    result.os = "iOS";
  }

  // 提取架构信息
  result.architecture = val.includes("x64") ? "64-bit" : "32-bit";

  return result;
}
