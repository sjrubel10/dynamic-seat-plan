<?php

namespace Dynamic\Seatplan;

use Dynamic\Seatplan\Admin\Ajax;
use Dynamic\Seatplan\Admin\Enque;
use Dynamic\Seatplan\Admin\Menu;
use Dynamic\Seatplan\Admin\MetaBoxes;
use Dynamic\Seatplan\Admin\RegisterCustomPost;

class Admin{

    /**
     * Initialize the class
     */
    public function __construct(){
        new Menu();
        new Enque();
//        new RegisterCustomPost();
        new MetaBoxes();
        new Ajax();
    }
}