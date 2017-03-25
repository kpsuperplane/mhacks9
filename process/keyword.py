import indicoio
import json
import re 
def simpleTokenize(string):
    split_regex = r'\W+'
    return list(filter(lambda x: len(x) > 0, re.split(split_regex, string.lower())))
def parse_stop_words(blob):

    stop_words = list(open("process/stopWords.txt","r"))

    for i in range(0, len(stop_words)):
        stop_words[i] = stop_words[i][:stop_words[i].index("\n")]

    return list(filter(lambda x: x.lower() not in stop_words, simpleTokenize(blob)))
 
def tf(tokens):
    counts = {}
    for key in tokens:
      if key in counts:
        counts[key] += 1
      else:
        counts[key] = 1
    n_tokens = len(tokens)
   
    freq = {}
    for k,v in counts.items():
      freq[k] = 1.0*v/ n_tokens
    return freq
 
def idf(tfdic, document):
    counts = {}
    for key in tfdic:
        for word in document:
            if word == key:
                if key in counts:
                    counts[key] += 1
                else:
                    counts[key]  = 1
                break;
    for key in counts:
        counts[key] = counts[key]
    return counts
    
def tfidf(tfdic, idfdic):
    for key in tfdic:
        tfdic[key] = tfdic[key] * idfdic[key]
    return tfdic


def keywords(blob): 
    things = []
    indicoio.config.api_key = 'ab83001ca5c484aa92fc18a5b2d6585c'
    people = indicoio.people(blob)
    for person in people: 
    	if person['confidence'] > 0.5: 
    		things.append(person['text'])		

    places = indicoio.places(blob)
    for place in places: 
    	if place['confidence'] > 0.5: 
    		things.append(place['text'])	
    print(things)
    blob = parse_stop_words(blob)
    tfdic = tf(blob)
    things.append(list(tfidf(tfdic, idf(tfdic, blob)).keys()))
    things = list(set(source_list))
    return things