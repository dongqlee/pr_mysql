//데이터베이스에 연결하는 일부 코드를 저장

const mysql = require('mysql2/promise');

//많은 요청, 큰 웹사이트가 있는 경우 createpool이 효율적
const pool = mysql.createPool({
  host: 'localhost',//데이터베이스 서버, 컴퓨터에서 실행하기에 host는 localhost 일반적으로 포트는 3306
  database: 'blog', //워크밴치에서 생성한 것 연결
  user: 'root', //자동 생성, 기본
  password: '111111' //데이터베이스 생성시 
}); //매개변수 값으로 자바스크립트 객체가 필요
//pool을 이용해서 데이터베이스 모든 것 관리
module.exports = pool; 