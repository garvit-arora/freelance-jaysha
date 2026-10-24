import { writeFile, readFile } from 'node:fs/promises'
const sources = [
 ['park plaza shahdara','https://www.radissonhotels.com/en-us/hotels/park-plaza-delhi-cbd-shahdara'],
 ['elegante mall','https://stores.homecentre.in/home-centre-home-furniture-shop-netaji-shubhash-place-new-delhi-487181/Contact-Us'],
 ['qureshi kabab corner sector 54 gurgaon','https://www.district.in/dining/ncr/qureshi-kabab-corner-sector-54-gurgaon'],
 ['Forresta Gurgaon','https://www.district.in/dining/ncr/the-forestta-golf-course-road-gurgaon'],
 ['nsp tasteland','https://www.district.in/dining/ncr/tasteland-netaji-subhash-place-new-delhi-1'],
 ['32nd avenue','https://www.district.in/dining/ncr/32nd-avenue-sector-15-gurgaon'],

 ['Boho bistro vaishali','https://www.district.in/dining/ncr/boho-bistro-vaishali-ghaziabad'],
 ['cp ministry of beer','https://www.district.in/dining/ncr/ministry-of-beer-connaught-place-new-delhi'],
 ['kesar pitampura','https://www.district.in/dining/ncr/kesar-pitampura-new-delhi'],
 ['pindi pandara road','https://www.district.in/dining/ncr/pindi-pandara-road-new-delhi'],
 ['nebo ansal plaza','https://www.district.in/dining/ncr/nebo-khel-gaon-marg-new-delhi'],
 ['unwind cafe ansal plaza','https://www.district.in/dining/ncr/unwind-cafe-khel-gaon-marg-new-delhi'],
 ['delhi heights cafe nsp','https://www.district.in/dining/ncr/cafe-delhi-heights-netaji-subhash-place-new-delhi'],
 ['Sector 4 vaishali lenskart.com','https://www.lenskart.com/stores/optometrist-sunglasses-vaishali-sector-4-ghaziabad-60981/home'],
 ['Forresta Gurgaon','https://www.district.in/dining/ncr/forresta-sector-39-gurgaon'],
 ['nsp tasteland','https://www.district.in/dining/ncr/tasteland-netaji-subhash-place-new-delhi'],
 ['qureshi kabab corner sector 54 gurgaon','https://www.district.in/dining/ncr/qureshi-kabab-corner-golf-course-road-gurgaon'],
 ['madras cafe shalimar','https://www.district.in/dining/ncr/madras-cafe-shalimar-bagh-new-delhi'],
 ['bobby punjabj rasoi','https://www.district.in/dining/ncr/bobby-punjabi-rasoi-rohini-new-delhi'],
 ['Hari om chole bhature','https://www.district.in/dining/ncr/hari-om-chole-bhature-rohini-new-delhi'],
]
let registry = JSON.parse(await readFile('src/venue-coordinates.json','utf8').catch(()=>'{}'))
for (const [name, source] of sources) {
 try {
  const response = await fetch(source, {signal:AbortSignal.timeout(20000)})
  if(!response.ok) { console.log(name,'no matched page');continue }
  const html = await response.text()
  const found=[]
  for(const match of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
   try {
    const data=JSON.parse(match[1]); const items=Array.isArray(data)?data:[data]
    for(const item of items) {
     const lat=Number(item.geo?.latitude),lon=Number(item.geo?.longitude)
     if(lat>20 && lat<35 && lon>70 && lon<85) found.push({name:item.name,latitude:lat,longitude:lon,address:item.address})
    }
   }catch{}
  }
  if (!found.length) {
    const pairs = [...html.matchAll(/"latitude"\s*:\s*"?([0-9.]+)"?\s*,\s*"longitude"\s*:\s*"?([0-9.]+)/g)]
    const unique = [...new Set(pairs.map(match => match[1]+','+match[2]))]
    if (unique.length === 1) { const [latitude, longitude] = unique[0].split(',').map(Number); found.push({ name, latitude, longitude, address: html.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1] || name }) }
  }
  if(found.length!==1) { console.log(name,'no unique published coordinate');continue }
  const result=found[0]
  console.log(name,JSON.stringify(result))
  registry[name.toLowerCase()]={...result,source,verifiedAt:'2026-10-24',precision:'venue listing'}
 } catch { console.log(name,'source unavailable') }
}
await writeFile('src/venue-coordinates.json',JSON.stringify(registry,null,2)+'\n')
