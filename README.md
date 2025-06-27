MLB 球員資料牆

主要功能

球隊與球員列表：依球季與球隊篩選，顯示當季球員清單。

球員卡片：顯示球員大頭照、姓名、位置、背號，加入／取消最愛。

數據排行榜：依投打項目（ERA、打擊率、全壘打等）產生前 20 名長條圖，點擊顯示球員頭像與姓名。

球員詳情：點擊球員卡片可檢視完整的賽季投打數據，並提供高光影片連結。

本地收藏：使用 localStorage 保存最愛球員列表，下次造訪仍可保留。

使用說明

選擇球季：上方下拉選單預設為當前年份，可自由切換回過往球季。

選擇球隊：依英文字母排序載入所有 MLB 球隊並顯示中文隊名。

篩選投打：可只顯示投手／打者

查看排行：切換到排行榜選單，頁面切換至長條圖模式。

收藏球員：點擊球員卡片右上星號，即可加入或移除最愛。

檢視詳情：在球員卡片或長條圖點擊即可查看統計數據並連結至 YouTube 高光影片。

API

https://statsapi.mlb.com/api/v1/teams?sportId=1：
取得球隊列表，回傳所有 MLB 球隊的基本資料（如 team.id、team.name、team.abbreviation

https://statsapi.mlb.com/api/v1/teams/{teamId}/roster?rosterType=activeRoster&season={season}：
取得隊伍名單

https://statsapi.mlb.com/api/v1/people/{playerId}/stats?stats=season&season={season}&group={hitting|pitching}：
取得球員賽季統計

https://statsapi.mlb.com/api/v1/stats?stats=season&season={season}&group={group}&sportId=1&playerPool=all&limit=5000：
取得排行榜數據
https://midfield.mlbstatic.com/v1/people/{playerId}/headshot/67/current:
取得球員頭像
