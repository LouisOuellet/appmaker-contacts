<?php
class contactsHelper extends Helper {

	// public function buildRelation($relations,$relation){
	// 	$relationships = $this->getRelationships($relation['relationship'],$relation['link_to']);
	// 	foreach($relationships as $id => $links){
	// 		foreach($links as $details){
	// 			if(in_array($details['relationship'],['users'])){
	// 				if(isset($this->Settings['plugins'][$details['relationship']]['status']) && $this->Settings['plugins'][$details['relationship']]['status']){
	// 					$recordDetail = $this->Auth->query('SELECT * FROM `'.$details['relationship'].'` WHERE `id` = ?',$details['link_to']);
	// 					if($recordDetail->numRows() > 0){
	// 						$recordDetail = $recordDetail->fetchAll()->All()[0];
	// 						$relations[$relation['relationship']][$relation['link_to']][$details['relationship']][$details['link_to']] = $recordDetail;
	// 					}
	// 				}
	// 				if($details['relationship'] == 'event_attendances' && isset($this->Settings['plugins']['events']['status']) && $this->Settings['plugins']['events']['status']){
	// 					$recordDetail = $this->Auth->query('SELECT * FROM `event_attendances` WHERE `id` = ?',$details['link_to']);
	// 					if($recordDetail->numRows() > 0){
	// 						$recordDetail = $recordDetail->fetchAll()->All()[0];
	// 						$relations[$relation['relationship']][$relation['link_to']][$details['relationship']][$details['link_to']] = $recordDetail;
	// 					}
	// 				}
	// 			}
	// 		}
	// 	}
  //   return $relations;
  // }
}
