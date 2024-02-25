# Vasarazzi ⛷️ 📸

![Lista med vasaloppsåkare och vilken station som precis passerades samt deras uppskattade åktid. Personernas namn är censurerade.](./docs/vasarazzi.png)

Tänkte jag skulle följa lite kompisar på årets vasa men... Det kostar monis. 🥰

Uppdateras var 10e sekund!

## Setup

Leta upp `idp` för personerna du följer. Det gör du genom att söka upp personen på följande sida och klicka in dig på personens resultatsida.

Plocka ut det som står efter `idp=``
> https://results.vasaloppet.se/2024/?content=detail&...&`idp=XOXOGOSSIP`&...

I detta fallet är `XOXOGOSSIP` vårt `idp`

Upprepa för varje person du vill följa och spara på nåt bra ställe

## Köra 

`bun src/index.ts idp1,idp2,idp3`