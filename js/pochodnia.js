import {db,ref,onValue} from "./firebase.js";

export function startPochodnia(){

    const r = ref(db,"rut200/stan_aktualny");

    onValue(r,(snapshot)=>{

        const d = snapshot.val();

        if(!d) return;

        let status="🟢 ONLINE";

        const age=(Date.now()-d.timestamp)/1000;

        if(age>180)
            status="🔴 OFFLINE";
        else if(age>60)
            status="🟡 BRAK AKTUALIZACJI";

        document.getElementById("app").innerHTML=`

<div class="card">

<h2>🔥 POCHODNIA</h2>

<div class="status">${status}</div>

<div class="value">
<span>Temperatura</span>
<b>${d.temperatura} °C</b>
</div>

<div class="value">
<span>Podciśnienie</span>
<b>${(d.podcisnienie/10).toFixed(1).replace(".",",")} mbar</b>
</div>

<div class="value">
<span>Falownik</span>
<b>${(d.falownik/100).toFixed(2).replace(".",",")} Hz</b>
</div>

<div class="value">
<span>Aktualizacja</span>
<b>${new Date(d.timestamp).toLocaleString("pl-PL")}</b>
</div>

</div>

`;

    });

}
