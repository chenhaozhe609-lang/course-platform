// 随机匿名昵称生成，如「匿名的考拉#3271」
const ANIMALS = [
  "考拉",
  "水豚",
  "刺猬",
  "貂熊",
  "海獭",
  "羊驼",
  "树懒",
  "狐狸",
  "浣熊",
  "企鹅",
  "猫头鹰",
  "柴犬",
  "仓鼠",
  "锦鲤",
  "海豚",
];

export function generateNickname(): string {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(1000 + Math.random() * 9000); // 4 位
  return `匿名的${animal}#${num}`;
}
