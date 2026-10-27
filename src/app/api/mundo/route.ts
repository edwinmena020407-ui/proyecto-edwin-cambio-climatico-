import { NextResponse } from "next/server";
const selected: Record<string,string>={OWID_WRL:"Mundo",PER:"Perú",USA:"Estados Unidos",CHN:"China",IND:"India",BRA:"Brasil",DEU:"Alemania",JPN:"Japón",ESP:"España"};
export async function GET(){
 try{
  const url="https://ourworldindata.org/grapher/co-emissions-per-capita.csv?v=1&csvType=full&useColumnShortNames=false";
  const response=await fetch(url,{next:{revalidate:3600},headers:{"User-Agent":"KARBO-educational-project/1.0"}});
  if(!response.ok)throw new Error("Fuente no disponible");
  const csv=await response.text();const lines=csv.trim().split(/\r?\n/);const latest=new Map<string,{code:string;country:string;year:number;value:number}>();
  for(const line of lines.slice(1)){
   const match=line.match(/^"?([^",]+)"?,"?([^",]+)"?,(\d{4}),([\d.eE+-]+)/);
   if(!match)continue;
   const code=match[2],year=Number(match[3]),value=Number(match[4]);
   if(!selected[code]||!Number.isFinite(value))continue;
   const prev=latest.get(code);if(!prev||year>prev.year)latest.set(code,{code,country:selected[code],year,value});
  }
  if(latest.size===0)throw new Error("Sin datos compatibles");
  return NextResponse.json({items:Object.keys(selected).flatMap(k=>latest.has(k)?[latest.get(k)]:[]),updated:new Date().toISOString()},{headers:{"Cache-Control":"public, max-age=0, s-maxage=3600"}});
 }catch{return NextResponse.json({error:"No se pudieron obtener los datos"},{status:503})}
}
