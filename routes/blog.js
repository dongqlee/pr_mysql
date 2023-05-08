const express = require('express'); //express 내장 router 기능 사용하기 위해 express 요청

const db = require('../data/database');

const router = express.Router(); // 함수로 호출하여 router 사용

router.get('/', function(req, res) { //appjs 에서 3000, 요청 응답
  res.redirect('/posts');
});

router.get('/posts', async function(req, res) { 
  const query = `
    SELECT posts.*, authors.name AS author_name FROM posts
    INNER JOIN authors ON posts.author_id = authors.id
  `;
  const [posts] = await db.query(query); //게시물 목록을 가져오고 posts로 지정
  res.render('posts-list', { posts: posts}); //키 : 비구조화로 가져온 것 
});

router.get('/new-post', async function(req, res) {
  const [authors] = await db.query('SELECT * FROM authors');
  //실행할 쿼리문, 해당 테이블 데이터 제공, 비동기 적용 mysql2에서 promise 지원, 함수 실행에 async를 db실행에 await을 적용하여 실행 하게 하면 렌더링은 그 이후에 실행
  res.render('create-post', {authors: authors}); //노출될 키 : 위에 비구조화된 작성자 목록 ㄴ
});

router.post('/posts', async function(req, res) {
  //req.body; //req.body에 제목, 요약, 내용, 작성자가 포함된 객체가 저장된다
  //mysql 패키지를 사용했기에 values 뒤괄호 내부에
  const data =[
    req.body.title,
    req.body.summary,
    req.body.content,
    req.body.author
  ]; //html name에서 따와야 함 
  await db.query('INSERT INTO posts (title, summary, body, author_id) VALUES (?)', [
    data,
  ]);// ?는 자리표시자 ??? [data[0], data[1]] 불필요하게 길어지는 것을 방지하기위해,
  //APP 13줄에 미들웨어 실행해서

  res.redirect('/posts');
});

router.get('/posts/:id', async function(req, res) {
  const query = `
    SELECT posts.*, authors.name AS author_name, authors.email AS author_email FROM posts 
    INNER JOIN authors ON posts.author_id = authors.id
    WHERE posts.id = ?
  `

  const [posts] = await db.query(query, [req.params.id]);
  // ?가 하나이기에 배열에는 값이 하나만 필요함, /:id자리 구체적인 값을 추출하는 방법 []안 값이 ?로 가서 작동하게 된다

  // async await 으로 비동기, 
  // 첫번째 항목은 가져온 레코드, 두번째 항목은 메타데이터
  // result를 게시물을 가져오기 위해 배열 비구조화 사용
  // 게시물 전달하기 위해 키 사용, 첫 항목
  // 게시물이 정의되지 않았는지, 없는지 확인해야
  
  if (!posts || posts.length === 0 ) {
    return res.status(404).render('404');
  }

  const postData = {
    ...posts[0], //단일 게시물의 모든 데이터를 해당 객체로 가져온다
    date: posts[0].date.toISOString(), //toISOString 날짜 객체메소드로 표준, 머신 판독 가능한 문자열 표현으로 변환합니다 datetime 속성에 필요한 것
    readableDate :posts[0].date.toLocaleDateString('ko-KR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  // 404 페이지를 렌더링 할 것이고 return문이 없다면 다음 행도 실행되어서 작동하지 않는 두개의 응답을 보내려하게 될 것
  //return을 추가하여 아래 행이 실행되지 않게 함
  res.render('post-detail', { post: postData })
});

router.get('/posts/:id/edit', async function(req, res) {
  // :id는 데이터베이스에서 특정 게시물을 제공할 url에서 얻은 id
  const query = `
    SELECT * FROM posts WHERE id = ?
  `;
  const [posts] = await db.query(query, [req.params.id]); 
  //게시물을 가져오기 위해 비구조화,  
  //req.params.id

  if (!posts || posts.length === 0 ) {
    return res.status(404).render('404');
  }

  res.render('update-post', { post : posts[0]});
});

router.post('/posts/:id/edit', async function(req, res) {
  const query =`
    UPDATE posts SET title = ?, summary = ?, body =?
    WHERE id = ? 
  `;

  const [] = await db.query(query, [
    req.body.title, 
    req.body.summary, 
    req.body.content, 
    req.params.id
  ]); //update 템플릿 name 내용과 id는 실제 경로의 id, where절 id
  
  res.redirect('/posts'); //완료되면 다시 호출
});


router.post('/posts/:id/delete', async function(req, res) {
  await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
  res.redirect('/posts');
});
module.exports = router;
