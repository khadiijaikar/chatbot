import json
import random
from typing import Any, Text, Dict, List
from difflib import SequenceMatcher

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import EventType

class ActionDirectFormLinks(Action):
    def name(self) -> Text:
        return "action_direct_form_links"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[EventType]:
        dispatcher.utter_message(
            text="Sure! Here are the links where you can submit your requests:\n"
            "- [Support Request Form](https://example.com/support)\n"
            "- [Feature Requests Submission Form](https://example.com/feature-requests)\n"
        )
        return []

class ActionSearchQuestion(Action):
    def name(self) -> Text:
        return "action_search_question"

    def similar(self, a, b):
        return SequenceMatcher(None, a, b).ratio()

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[EventType]:
        # Load the data from the JSON file
        intent_name = tracker.latest_message['intent'].get('name')
        file_path = ''
        if intent_name == 'ask_announcements':
            file_path = '/Users/kads/Downloads/announcements.json'
        elif intent_name == 'ask_release_notes':
            file_path = '/Users/kads/Downloads/release-notes.json'
        elif intent_name == 'ask_support':
            file_path = '/Users/kads/Downloads/support.json'
        elif intent_name == 'ask_feature_requests':
            file_path = '/Users/kads/Downloads/feature-requests.json'
        
        if file_path:
            with open(file_path, 'r') as file:
                data = json.load(file)
        else:
            dispatcher.utter_message(text="Sorry, I couldn't find relevant data for your request.")
            return []

        # Get user input
        user_input = tracker.latest_message['text']

        # Search for the exact topic title mentioned in the user query
        for item in data:
            title = item.get('Topic Title', '')
            if title.lower() in user_input.lower():
                dispatcher.utter_message(text=f"Title: {title}\nDescription: {item.get('Topic Description', '')}")
                return []

        # If no matching topic is found, search for similar topics
        similar_topics = []
        for item in data:
            title = item.get('Topic Title', '')
            similarity_score = self.similar(user_input.lower(), title.lower())
            if similarity_score > 0.5: 
                similar_topics.append(item)

        # If similar topics are found, send the relevant information to the user
        if similar_topics:
            dispatcher.utter_message(text="Here are some similar topics:")
            for topic in similar_topics:
                dispatcher.utter_message(text=f"Title: {topic.get('Topic Title', '')}\nDescription: {topic.get('Topic Description', '')}")
        else:
            # Return message based on the user's input
            if intent_name == 'ask_announcements':
                dispatcher.utter_message(text=random.choice(["Hmm, I couldn't find any announcements matching that. Would you like to try a different query?", "Seems like there are no announcements related to that. What else can I assist you with?"]))
            elif intent_name == 'ask_release_notes':
                dispatcher.utter_message(text=random.choice(["I couldn't find any release notes on that. Want to ask about something else?", "Sorry, no release notes were found for your query. How else can I help?"]))
            elif intent_name == 'ask_support':
                dispatcher.utter_message(text=random.choice(["There are no support topics matching your query. Is there anything else you need assistance with?", "Sorry, I couldn't find any support topics related to that. What else can I assist you with?"]))
            elif intent_name == 'ask_feature_requests':
                dispatcher.utter_message(text=random.choice(["I couldn't find any feature requests related to your query. Would you like to ask about something else?", "No feature requests were found matching that query. What else can I assist you with?"]))
            else:
                dispatcher.utter_message(text="Sorry, I couldn't find relevant information for your request.")
                return []
            