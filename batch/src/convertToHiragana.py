from pykakasi import kakasi

# ファイルから漢字の単語リスト(,つなぎの文字列)を取得
fInput = open("tmpWords/inout.txt", "r", encoding='UTF-8')
strInputWords = fInput.read()
fInput.close()

# 漢字の単語リストをひらがなに変換
kks = kakasi()
convertedArray = kks.convert(strInputWords)
strOutputWords = ""
for convert in convertedArray:
  strOutputWords += convert['hira']

# ひらがなの単語リストをファイルに書き込み
fOutput = open("tmpWords/inout.txt", "w", encoding='UTF-8')
fOutput.write(strOutputWords)
fOutput.close()
