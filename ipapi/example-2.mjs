import util from "util";
const deb = x => util.inspect(x, { depth: null });

async function main() {
    // set endpoint and your access key
    const ULL = "193.145.118.52"
    let url = 'http://api.ipapi.com/' + ULL + '?access_key=' + process.env.IPAPI_KEY
    let r = await fetch(url).then(response => response.json());
    // output the "calling_code" object inside "location"
    console.log(deb(r));
}

main()