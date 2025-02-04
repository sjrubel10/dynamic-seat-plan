<?php

namespace Dynamic\Seatplan;




use Dynamic\Seatplan\Frontend\DisplayPlan;

class Frontend{

    /**
     * Initialize the class
     */
    public function __construct(){
//        error_log( print_r( [ 'from' => 'frontend' ], true ) );
        new DisplayPlan();
    }

}