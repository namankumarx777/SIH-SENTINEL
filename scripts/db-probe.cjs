const { Client } = require("pg");
const fs = require("fs");
const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    })
);
const url = env.DIRECT_URL || env.DATABASE_URL;
console.log("using host:", new URL(url).host);
const c = new Client({ connectionString: url });
c.connect()
  .then(async () => {
    const t = await c.query(
      "select pt.tablename, pc.relrowsecurity from pg_tables pt join pg_class pc on pc.relname = pt.tablename and pc.relnamespace = 'public'::regnamespace where pt.schemaname = 'public' order by pt.tablename"
    );
    console.log(JSON.stringify(t.rows, null, 1));
    const et = await c.query("select evtname, evtenabled, evtevent from pg_event_trigger");
    console.log("event triggers:", JSON.stringify(et.rows));
    const pol = await c.query("select * from pg_policies where schemaname='public'");
    console.log("policies rows:", pol.rowCount);
    await c.end();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });