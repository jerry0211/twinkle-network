module.exports = {
  fetchedVideoCodeFromURL: function (url) {
    var trimmedUrl = url.split("v=")[1].split("#")[0];
    var videoCode = trimmedUrl.split("&")[0];
    return videoCode;
  },
  processedTitleString: function (string) {
    var processedString = string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\/g, '\\\\');
    return processedString;
  },
  processedString: function (string) {
    var regex = /(\b(((https?|ftp|file|):\/\/)|www[.])[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    var tempString = string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '<br>')
    .replace(regex,"<a href=\"$1\" target=\"_blank\">$1</a>");
    var newString = "";
    while(tempString.length > 0){
      var position = tempString.indexOf("href=\"");
      if(position === -1){
        newString += tempString;
        break;
      }
      newString += tempString.substring(0, position + 6);
      tempString = tempString.substring(position + 6, tempString.length);
      if (tempString.indexOf("://") > 8 || tempString.indexOf("://") === -1) {
        newString += "http://";
      }
    }
    return newString;
  },
  cleanString: function (string) {
    var regexBr = /<br\s*[\/]?>/gi;
  	var regexAnchor = /<a[^>]*>|<\/a>/g;
  	var cleanedString = string.replace(regexBr, "\n").replace(regexAnchor, "");
  	return cleanedString;
  },
  capitalize: function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  stringIsEmpty: function (string) {
    var checkedString = string.replace(/\s/g, "").replace(/\r?\n/g, "");
    return (checkedString === "") ? true : false;
  }
}