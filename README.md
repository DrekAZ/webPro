webプログラミング課題
- 使用方法
readme.doc参照
http://mkmk-drekaz.xyz/webPro/
Google Map APIを使用し、自転車用のルートと移動時間を表示するプログラムを制作した。海外のGoogle Mapと違い、日本版のGoogle Mapでは、自転車を使用した場合のルートと移動時間を表示できないようになっている。そのため、徒歩のときのルートと距離をAPIで取得し、自転車の移動時間を表示するようになっている。
また、自転車の種類によって、移動時間が変わるようになっている。この基準はJIS(日本産業標準調査会)を基にした。JIS D 9111(https://www.jisc.go.jp/app/jis/general/GnrJISNumberNameSearchList?toGnrJISStandardDetailList)によると、シティサイクルの常用速度は10~20km/h、小径車の常用速度は10~15km/h、ロードバイクの常用速度は20~50km/hで、それぞれの中間の値である15km/h、12.5km/h、30km/hで計算した。
