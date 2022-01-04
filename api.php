<?php
class contactsAPI extends CRUDAPI {

	public function buildRelation($relations,$relation){
		$relationships = $this->getRelationships($relation['relationship'],$relation['link_to']);
		foreach($relationships as $id => $links){
			foreach($links as $details){
				if(in_array($details['relationship'],['users'])){
					if(isset($this->Settings['plugins'][$details['relationship']]['status']) && $this->Settings['plugins'][$details['relationship']]['status']){
						$recordDetail = $this->Auth->query('SELECT * FROM `'.$details['relationship'].'` WHERE `id` = ?',$details['link_to']);
						if($recordDetail->numRows() > 0){
							$recordDetail = $recordDetail->fetchAll()->All()[0];
							$relations[$relation['relationship']][$relation['link_to']][$details['relationship']][$recordDetail['id']] = $recordDetail;
						}
					}
					if($details['relationship'] == 'event_attendances' && isset($this->Settings['plugins']['events']['status']) && $this->Settings['plugins']['events']['status']){
						$recordDetail = $this->Auth->query('SELECT * FROM `event_attendances` WHERE `id` = ?',$details['link_to']);
						if($recordDetail->numRows() > 0){
							$recordDetail = $recordDetail->fetchAll()->All()[0];
							$relations[$relation['relationship']][$relation['link_to']][$details['relationship']][$recordDetail['id']] = $recordDetail;
						}
					}
				}
			}
		}
    return $relations;
  }

	public function create($request = null, $data = null){
		if(isset($data)){
			if(!is_array($data)){ $data = json_decode($data, true); }
			if(isset($data['email'])){
				$data['isActive'] = 'true';
				$data['organization'] = $data['link_to'];
				$data['initials'] = '';
				if($data['first_name'] != ''){ $data['initials'] .= substr($data['first_name'],0,1).'.'; }
				if($data['middle_name'] != ''){ $data['initials'] .= substr($data['middle_name'],0,1).'.'; }
				if($data['last_name'] != ''){ $data['initials'] .= substr($data['last_name'],0,1).'.'; }
				$contacts = $this->Auth->query('SELECT * FROM `contacts` WHERE `email` = ?',$data['email']);
				if($contacts->numRows() > 0 && $data['email'] != ''){
					if((isset($data['relationship'],$data['link_to']))&&($data['relationship'] != '')&&($data['link_to'] != '')){
						$contacts = $contacts->fetchAll()->all();
						foreach($contacts as $contact){
							$this->createRelationship([
								'relationship_1' => $data['relationship'],
								'link_to_1' => $data['link_to'],
								'relationship_2' => 'contacts',
								'link_to_2' => $contact['id'],
							]);
							if($contact['isActive'] != 'true'){
								$contact['isActive'] = 'true';
								$result = $this->Auth->update('contacts',$contact,$contact['id']);
							}
						}
						return [
							"success" => $this->Language->Field["Record successfully linked"],
							"request" => $request,
							"data" => $data,
							"output" => [
								'dom' => $this->convertToDOM($contacts[0]),
								'raw' => $contacts[0],
							],
						];
					}
				} else {
					$create = parent::create('contacts', $data);
					if((isset($create['success'],$data['relationship'],$data['link_to']))&&($data['relationship'] != '')&&($data['link_to'] != '')){
						$create['output']['relationship']['raw'] = $this->createRelationship([
							'relationship_1' => $data['relationship'],
							'link_to_1' => $data['link_to'],
							'relationship_2' => 'contacts',
							'link_to_2' => $create['output']['dom']['id'],
						]);
						$create['output']['relationship']['dom'] = $this->convertToDOM($create['output']['relationship']['raw']);
					}
					return $create;
				}
			}
		}
	}

	public function read($request = null, $data = null){
		if(($data != null)||($data == null)){
			if(!is_array($data)){ $data = json_decode($data, true); }
			$contacts['raw'] = $this->Auth->query('SELECT * FROM `contacts`');
			if($contacts['raw']->numRows() == 1){ $contacts['raw'] = $contacts['raw']->fetchAll()->all(); } else { $contacts['raw'] = []; }
			foreach($contacts['raw'] as $key => $contact){ $contacts['dom'][$key] = $this->convertToDOM($contact); }
			$headers = $this->Auth->getHeaders('contacts');
			foreach($headers as $key => $header){
				if((!$this->Auth->valid('field',$header,1,$request))||(in_array($header,['username','type','location','password','status','organization','isWelcomed','tokenLogin','tokenAPI','tokenReset','last_login']))){
					foreach($raw as $row => $values){
						unset($contacts['raw'][$row][$header]);
						unset($contacts['dom'][$row][$header]);
					}
					unset($headers[$key]);
				}
			}
			$results = [
				"success" => $this->Language->Field["This request was successfull"],
				"request" => $request,
				"data" => $data,
				"output" => [
					'headers' => $headers,
					'raw' => $contacts['raw'],
					'dom' => $contacts['dom'],
				],
			];
		} else {
			$results = [
				"error" => $this->Language->Field["Unable to complete the request"],
				"request" => $request,
				"data" => $data,
			];
		}
		return $results;
	}

	public function update($request = null, $data = null){
		if($data != null){
			if(!is_array($data)){ $data = json_decode($data, true); }
			$user['raw'] = $this->Auth->read('contacts',$data['id']);
			if($user['raw'] != null){
				$user['raw'] = $user['raw']->all()[0];
				$update= $this->Auth->update('contacts',$this->convertToDB($data),$data['id']);
				if($update){
					$user['raw'] = $this->Auth->read('contacts',$data['id'])->all()[0];
					$user['dom'] = $this->convertToDOM($user['raw']);
					$results = [
						"success" => $this->Language->Field["Record successfully updated"],
						"request" => $request,
						"data" => $data,
						"output" => [
							'dom' => $user['dom'],
							'raw' => $user['raw'],
						],
					];
				} else {
					$results = [
						"error" => $this->Language->Field["Unable to complete the request"],
						"request" => $request,
						"data" => $data,
						"output" => [
							'dom' => $user['raw'],
						],
					];
				}
			} else {
				$results = [
					"error" => $this->Language->Field["Unable to complete the request"],
					"request" => $request,
					"data" => $data,
				];
			}
		} else {
			$results = [
				"error" => $this->Language->Field["Unable to complete the request"],
				"request" => $request,
				"data" => $data,
			];
		}
		return $results;
	}

	public function delete($request = null, $data = null){
		if(isset($data)){
			if(!is_array($data)){ $data = json_decode($data, true); }
			// Fetch Contact
			$user = $this->Auth->read('contacts',$data['id']);
			if($user != null){
				$user = $user->all()[0];
				// Fetch Relationships
				$relationships = $this->getRelationships('contacts',$user['id']);
				$count = 0;
				$link_to = 0;
				// Find Organizations
				if((isset($relationships))&&(!empty($relationships))){
					foreach($relationships as $id => $relations){
						foreach($relations as $relation){
							if($relation['relationship'] == 'organizations'){ $count++; }
							if(isset($data['link_to']) && $relation['link_to'] == $data['link_to']){ $link_to = $id; }
						}
					}
				}
				if(isset($data['link_to']) && $count > 1){
					$this->Auth->delete('relationships',$link_to);
					$results = [
						"success" => $this->Language->Field["Record successfully removed"],
						"request" => 'contacts',
						"data" => $data,
						"output" => [
							'dom' => $this->convertToDOM($user),
							'raw' => $user,
						],
					];
				} else {
					if((isset($user['isActive']))&&($user['isActive'] == "true")){
						$user['isActive'] = 'false';
						$result = $this->Auth->update('contacts',$user,$user['id']);
						$results = [
							"success" => $this->Language->Field["Record successfully deleted"],
							"request" => 'contacts',
							"data" => $data,
							"output" => [
								'dom' => $this->convertToDOM($user),
								'raw' => $user,
							],
						];
					} else {
						// Delete Relationships
						if((isset($relationships))&&(!empty($relationships))){
							foreach($relationships as $id => $links){
								$this->Auth->delete('relationships',$id);
							}
						}
						// Delete Record
						$result = $this->Auth->delete('contacts', $user['id']);
						// Return
						$results = [
							"success" => $this->Language->Field["Record successfully deleted"],
							"request" => $request,
							"data" => $data,
							"output" => [
								'dom' => $this->convertToDOM($user),
								'raw' => $user,
							],
						];
					}
				}
			} else {
				$results = [
					"error" => $this->Language->Field["Unable to complete the request"],
					"request" => $request,
					"data" => $data,
					"output" => [
						'dom' => $user,
					],
				];
			}
		} else {
			$results = [
				"error" => $this->Language->Field["Unable to complete the request"],
				"request" => $request,
				"data" => $data,
			];
		}
		// Return
		return $results;
	}
}
