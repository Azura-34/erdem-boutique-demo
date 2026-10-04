<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function out(array $d,int $c=200):never{http_response_code($c);echo json_encode($d,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function db():PDO{$c=require __DIR__.'/config.php';$d=$c['db'];return new PDO("mysql:host={$d['host']};dbname={$d['name']};charset=utf8mb4",$d['user'],$d['pass'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);}
function arr($v):array{if(is_array($v))return $v;if(!$v)return [];return array_values(array_filter(array_map('trim',preg_split('/[,;\r\n]+/',$v))));}
try{$pdo=db();$action=$_GET['action']??'products';
if($action==='products'){$rows=$pdo->query("SELECT id,slug,name,category,price,compare_price,badge,description,sizes_json,colors_json,image_url,gallery_json,stock,active FROM products WHERE active=1 ORDER BY id DESC")->fetchAll();foreach($rows as &$p){$p['id']=(int)$p['id'];$p['price']=(float)$p['price'];$p['compare_price']=$p['compare_price']===null?null:(float)$p['compare_price'];$p['stock']=(int)$p['stock'];$p['sizes']=$p['sizes_json']?json_decode($p['sizes_json'],true):[];$p['colors']=$p['colors_json']?json_decode($p['colors_json'],true):[];$p['gallery']=$p['gallery_json']?json_decode($p['gallery_json'],true):[];unset($p['sizes_json'],$p['colors_json'],$p['gallery_json'],$p['active']);}out(['ok'=>true,'products'=>$rows]);}
if($action==='checkout'){
 if($_SERVER['REQUEST_METHOD']!=='POST')out(['ok'=>false,'error'=>'Method'],405);
 $in=json_decode(file_get_contents('php://input'),true)?:[];$name=trim((string)($in['customer_name']??''));$phone=trim((string)($in['customer_phone']??''));$email=trim((string)($in['customer_email']??''));$address=trim((string)($in['address']??''));$items=$in['items']??[];
 if(mb_strlen($name)<2||mb_strlen($phone)<7||mb_strlen($address)<10||!filter_var($email,FILTER_VALIDATE_EMAIL)||!is_array($items)||!count($items))out(['ok'=>false,'error'=>'Lütfen müşteri bilgilerini ve ürünleri eksiksiz doldurun.'],422);
 $pdo->beginTransaction();$clean=[];$total=0.0;
 $q=$pdo->prepare("SELECT id,slug,name,price,stock,active FROM products WHERE slug=? FOR UPDATE");
 foreach($items as $it){$slug=trim((string)($it['slug']??''));$qty=max(1,min(20,(int)($it['qty']??1)));$q->execute([$slug]);$p=$q->fetch();if(!$p||!(int)$p['active'])throw new Exception('Ürün bulunamadı: '.$slug);if((int)$p['stock']>0 && (int)$p['stock']<$qty)throw new Exception($p['name'].' için yeterli stok yok.');$price=(float)$p['price'];$total+=$price*$qty;$clean[]=['product_id'=>(int)$p['id'],'slug'=>$p['slug'],'name'=>$p['name'],'price'=>$price,'qty'=>$qty,'size'=>trim((string)($it['size']??'')),'color'=>trim((string)($it['color']??''))];}
 $orderNo='EB'.date('ymd').strtoupper(bin2hex(random_bytes(3)));$st=$pdo->prepare("INSERT INTO orders(order_no,customer_name,customer_phone,customer_email,total,status,payment_status,shipping_status,address,items_json) VALUES(?,?,?,?,?,'new','pending','pending',?,?)");$st->execute([$orderNo,$name,$phone,$email,$total,$address,json_encode($clean,JSON_UNESCAPED_UNICODE)]);$id=(int)$pdo->lastInsertId();$pdo->commit();out(['ok'=>true,'order_no'=>$orderNo,'order_id'=>$id,'total'=>$total,'payment'=>'iyzico_pending']);
}
out(['ok'=>false,'error'=>'Not found'],404);
}catch(Throwable $e){if(isset($pdo)&&$pdo->inTransaction())$pdo->rollBack();out(['ok'=>false,'error'=>'İşlem sırasında bir hata oluştu.'],500);}