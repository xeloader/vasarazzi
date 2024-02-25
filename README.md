# Vasarazzi ⛷️ 📸

![Lista med vasaloppsåkare och vilken station som precis passerades samt deras uppskattade åktid. Personernas namn är censurerade.](./docs/vasarazzi.png)

Tänkte jag skulle följa lite kompisar på årets vasa men... Det kostar monis. 🥰

Uppdateras var 10e sekund!

## Setup

🔎 [Sök efter deltagare på vasaloppet här](https://results.vasaloppet.se/2024/)

Sök upp deltagarna du vill följa under loppet och klicka dig in på deras sida. Kopiera länken och extrahera parametern `idp` från länken.

**Exempel**
<pre>https://results.vasaloppet.se/2024/?content=detail&...<strong>&idp=XOXOGOSSIP</strong>&...</pre>

Plocka ut det som står efter `idp=`
I detta fallet är `XOXOGOSSIP` personens `idp`

Upprepa för varje person du vill följa och spara på nåt bra ställe

## Köra

`bun src/index.ts idp1,idp2,idp3`

Har använt [Bun](https://bun.sh/) under utvecklingen som har inbyggt stöd för Typescript, vill du använda `tsc` eller liknande får du knåpa ihop en tsconfig själv ✨

## Frivilligt

### Support för pusnotiser

Vasarazzi använder sig utav [Pushover](https://pushover.net/)
- Skaffa ett konto
  - Skapa en `Application/API Token`
  - Skriv ner
- Installera appen på din mobil
  - Leta upp `User Key`
  - Skriv ner

Kopiera `.env.sample` och döp om till `.env`
Fyll i med uppgifterna du skrev ner innan.

Pang ping pong. 🏓