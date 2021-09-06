var menuId = chrome.contextMenus.create({
  title: "OSINT=*",
  id: "parent",
  contexts: [ "selection" ],
  onclick: main,
})

const osint_urls = {
  abuseipdb: `https://www.abuseipdb.com/check/`,
  greynoise: `https://www.greynoise.io/viz/ip/`,
  hybridanalysis: `https://www.hybrid-analysis.com/search?query=`,
  ibmxforce: `https://exchange.xforce.ibmcloud.com/search/`,
  ipinfo: `https://ipinfo.io/`,
  shodan: `https://www.shodan.io/search?query=`,
  talosintelligence: `https://talosintelligence.com/reputation_center/lookup?search=`,
  virustotal: `https://www.virustotal.com/gui/search/`
};

function get_osint_urls_by_ioc_type(ioc_type, default_sources, IOC) {
  var urls = [];

  chrome.storage.sync.get({ioc_type: default_sources},
  function(items) {
    items.ioc_type.forEach(function (item, index) { // Iterate every OSINT source you have selected
      urls.push(osint_urls[item] + IOC);
    });
    chrome.windows.create({ // Create the windows with the OSINT URLs
      url: urls,
      incognito: false,
    });
  });
}

function main(info, tab) {
	// get highlighted text
	var IOC = info.selectionText;

	// replace "[dot]" with "."
	IOC = IOC.replace(/\[dot\]/g, '.');

	// remove whitespace, quotes, brackets
	IOC = IOC.replace(/[\"\'\[\] ]/g, '');

	// regex check if IOC is md5, sha1, sha256 hash
	var ishash = !IOC.search(/\b[A-Fa-f0-9]{32,64}\b/);

	// regex check if IOC is IPv4 address
	var isIP = !IOC.search(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/);

	if (ishash){ // search hash OSINT sources
    get_osint_urls_by_ioc_type('filehash_osint_sources', ['virustotal', 'talosintelligence', 'ibmxforce', 'hybridanalysis'], IOC);
	}
	else if (isIP){ // search IP OSINT sources
    get_osint_urls_by_ioc_type('ip_osint_sources', ['virustotal', 'talosintelligence', 'ibmxforce', 'ipinfo', 'abuseipdb', 'greynoise', 'shodan'], IOC);
	}
	else{ // assume IOC is domain name, search domain name OSINT sources
    get_osint_urls_by_ioc_type('domain_osint_sources', ['virustotal', 'talosintelligence', 'ibmxforce', 'shodan'], IOC);
	}
}
