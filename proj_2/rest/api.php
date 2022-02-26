<?php

require '../vendor/autoload.php' ;        
require_once('rest.php');
require_once('mongo.php');
     
class API extends REST {

    public $data = '';

    public function __construct(){
        parent::__construct();      
              $this->db = new db() ;           
    }

    public function processApi(){
        $func = "_".$this->_endpoint;
        if((int)method_exists($this,$func) > 0) {
            $this->$func();
        }  else {
            $this->response('Page not found', 404);
        }
    }

    private function _register() {

        if($this->get_request_method() != 'POST') {
            $this->response('', 406);
        }
 
        if(!empty($this->_request)) {
            try {
                $json_array = json_decode($this->_request,true);
                $res = $this->db->newUser($json_array);
                if ($res) {
                    $result = array('return'=>'Użytkownik zarejestrowany');
                    $this->response($this->json($result), 200);
                } else {
                    $result = array('return'=>'Użytkownik z danym adresem email już istnieje!');
                    $this->response($this->json($result), 200);
                }
            } catch (Exception $e) {
                $this->response('', 400) ;
            }
        } else {
            $error = array('status' => 'Failed', 'msg' => 'Error in _register()');
            $this->response($this->json($error), 400);
        }
    }

    private function _login() {

        if ($this->get_request_method() != 'POST') {
            $this->response('', 406);
        }
 
        if (!empty($this->_request)) {
            try {
                $json_array = json_decode($this->_request,true);
                $res = $this->db->checkUser($json_array);
                if ( $res ) {
                session_start();
                    $_SESSION['auth'] = 'OK';
                    $_SESSION['user'] = $json_array[email];
                    $result = array('return' => 'Zalogowano pomyślnie.');
                    $this->response($this->json($result), 200);
                } else {
                    $result = array('return' => 'Błąd logowania.');
                    $this->response($this->json($result), 200);
                }
            } catch (Exception $e) {
                $this->response('', 400);
            }
        } else {
            $error = array('status' => 'Failed', 'msg' => 'Error in _login()');
            $this->response($this->json($error), 400);
        }
    }

    private function _logout() {
        if($this->get_request_method() != 'POST') {
            $this->response('',406);
        }
            unset($_SESSION);
            session_destroy();
            $result = array('return'=>'Wylogowano pomyślnie.');
            $this->response($this->json($result), 200);
    }

    private function _list(){   
        if($this->get_request_method() != 'GET') {
            $this->response('', 406);
        }
        $result = $this->db->select();
        $this->response($this->json($result), 200);
    }

    private function _insert() {

        if($this->get_request_method() != 'POST') {
            $this->response('', 406);
        }
 
        if(!empty($this->_request) ){
            try {
                    $json_array = json_decode($this->_request,true);
                    $res = $this->db->insertUpdate($json_array);
                    if ( $res ) { 
                        $result = array('return'=>'Dane zostały przeniesione na serwer.');
                        $this->response($this->json($result), 200);
                    } else {
                        $result = array('return'=>'Bład.');
                        $this->response($this->json($result), 200);
                    }
            } catch (Exception $e) {
                $this->response('', 400);
            }
        } else {
            $error = array('status' => 'Failed', 'msg' => 'Error in _insert()');
            $this->response($this->json($error), 400);
        }
    }

    private function json($data) {
        if(is_array($data)){
            return json_encode($data);
        }
    }
}
         
    $api = new API;
    $api->processApi();
 
?>
