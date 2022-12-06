export default function getFirstWordIfGreaterThan(sentence, length) {
  return sentence?.replace(/ .*/, "")?.length > length
    ? `${sentence?.replace(/ .*/, "")?.substring(0, length)}...`
    : sentence?.replace(/ .*/, "");
}
