<?php
class contactsHelper extends Helper {

	public function buildRelation($relations){
    if(isset($relations['contacts'])){
			foreach($relations['contacts'] as $id => $contact){
				$relationships = $this->getRelationships('contacts',$id);
				foreach($relationships as $id => $links){
					foreach($links as $details){
						if($details['relationship'] == 'users' && isset($this->Settings['plugins'][$details['relationship']]['status']) && $this->Settings['plugins'][$details['relationship']]['status']){
							$record = $this->Auth->query('SELECT * FROM `'.$details['relationship'].'` WHERE `id` = ?',$details['link_to']);
							if($record->numRows() > 0){
								$record = $record->fetchAll()->All()[0];
								$relations['contacts'][$id][$details['relationship']][$record['id']] = $record;
							}
						}
					}
				}
			}
    }
    return $relations;
  }
}
