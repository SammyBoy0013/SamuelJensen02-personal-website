// The CV as an A4 PDF (specification 5.9), in the site's fonts and colours.
// It is the only place the phone number appears; there is never an address.

import path from "node:path";
import { Document, Font, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const fonts = path.join(process.cwd(), "lib/pdf/fonts");

Font.register({
  family: "Archivo",
  fonts: [
    { src: path.join(fonts, "archivo-latin-400-normal.woff"), fontWeight: 400 },
    { src: path.join(fonts, "archivo-latin-400-italic.woff"), fontWeight: 400, fontStyle: "italic" },
    { src: path.join(fonts, "archivo-latin-500-normal.woff"), fontWeight: 500 },
    { src: path.join(fonts, "archivo-latin-600-normal.woff"), fontWeight: 600 },
  ],
});
Font.register({
  family: "Bodoni Moda",
  fonts: [
    { src: path.join(fonts, "bodoni-moda-latin-500-normal.woff"), fontWeight: 500 },
    { src: path.join(fonts, "bodoni-moda-latin-500-italic.woff"), fontWeight: 500, fontStyle: "italic" },
    { src: path.join(fonts, "bodoni-moda-latin-600-normal.woff"), fontWeight: 600 },
  ],
});
// Keep words whole: the default splits them at any letter.
Font.registerHyphenationCallback((word) => [word]);

const colour = { pink: "#E8196F", pinkText: "#C2105A", ink: "#16131A", grey1: "#3A3540", grey2: "#5A5560", line: "#E4DFE3" };

const styles = StyleSheet.create({
  page: { paddingVertical: 48, paddingHorizontal: 52, fontFamily: "Archivo", fontSize: 9.5, lineHeight: 1.5, color: colour.grey1 },
  name: { fontFamily: "Bodoni Moda", fontWeight: 600, fontSize: 30, lineHeight: 1, color: colour.ink },
  contact: { marginTop: 12, fontSize: 9, color: colour.grey2 },
  link: { color: colour.grey2, textDecoration: "none" },
  rule: { marginTop: 14, height: 2, width: 48, backgroundColor: colour.pink },
  section: { marginTop: 18 },
  heading: { fontSize: 8, fontWeight: 500, letterSpacing: 1.6, textTransform: "uppercase", color: colour.pinkText, marginBottom: 6 },
  row: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: colour.line },
  years: { width: 110, color: colour.ink, fontWeight: 500 },
  text: { flex: 1 },
  bullet: { flexDirection: "row", marginBottom: 3 },
  dash: { width: 12, color: colour.pink },
  columns: { flexDirection: "row", gap: 18 },
  column: { flex: 1 },
  bold: { fontWeight: 600, color: colour.ink },
  italic: { fontStyle: "italic" },
  footer: { position: "absolute", bottom: 28, left: 52, right: 52, fontSize: 7.5, color: colour.grey2, textAlign: "right" },
});

export type CvData = {
  labels: {
    name: string;
    profile: string;
    education: string;
    positions: string;
    work: string;
    sport: string;
    skills: string;
    languages: string;
    interests: string;
  };
  contact: string[];
  email: string;
  profile: string;
  education: { years: string | null; text: string }[];
  positions: { years: string | null; text: string }[];
  work: { years: string | null; text: string }[];
  sport: string[];
  skills: string;
  languages: string;
  interests: string;
  footer: string;
};

/** **bold** and *italic* from the Markdown text blocks. */
function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
          <Text key={i} style={styles.bold}>
            {part.slice(2, -2)}
          </Text>
        ) : part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <Text key={i} style={styles.italic}>
            {part.slice(1, -1)}
          </Text>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Rows({ title, rows }: { title: string; rows: { years: string | null; text: string }[] }) {
  if (rows.length === 0) return null;
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.heading}>{title}</Text>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.years}>{row.years ?? ""}</Text>
          <Text style={styles.text}>{row.text}</Text>
        </View>
      ))}
    </View>
  );
}

export function CvDocument({ data }: { data: CvData }) {
  return (
    <Document title={`${data.labels.name}: CV`} author={data.labels.name} language="en-GB">
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.labels.name}</Text>
        <Text style={styles.contact}>
          {data.contact.join("  ·  ")}
          {"  ·  "}
          <Link src={`mailto:${data.email}`} style={styles.link}>
            {data.email}
          </Link>
        </Text>
        <View style={styles.rule} />

        <View style={styles.section}>
          <Text style={styles.heading}>{data.labels.profile}</Text>
          <Text>
            <Inline text={data.profile} />
          </Text>
        </View>

        <Rows title={data.labels.education} rows={data.education} />
        <Rows title={data.labels.positions} rows={data.positions} />
        <Rows title={data.labels.work} rows={data.work} />

        {data.sport.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.heading}>{data.labels.sport}</Text>
            {data.sport.map((line, i) => (
              <View key={i} style={styles.bullet}>
                <Text style={styles.dash}>–</Text>
                <Text style={styles.text}>
                  <Inline text={line} />
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.section, styles.columns]} wrap={false}>
          {[
            { title: data.labels.skills, text: data.skills },
            { title: data.labels.languages, text: data.languages },
            { title: data.labels.interests, text: data.interests },
          ]
            .filter((c) => c.text)
            .map((c) => (
              <View key={c.title} style={styles.column}>
                <Text style={styles.heading}>{c.title}</Text>
                <Text>
                  <Inline text={c.text} />
                </Text>
              </View>
            ))}
        </View>

        {data.footer && (
          <Text style={styles.footer} fixed>
            {data.footer}
          </Text>
        )}
      </Page>
    </Document>
  );
}
