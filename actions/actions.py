from typing import Any, Text, Dict, List
from difflib import SequenceMatcher
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import EventType
import json
import random
import re

class ActionSearchQuestion(Action):
    def name(self) -> Text:
        return "action_search_question"

    def similar(self, a, b):
        return SequenceMatcher(None, a, b).ratio()

    def normalize(self, text):
        return re.sub(r'\s+', ' ', re.sub(r'[^\w\s]', '', text.lower())).strip()

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[EventType]:
        support_file_path = '/Users/kads/Downloads/support.json'
        announcements_file_path = '/Users/kads/Downloads/announcements.json'

        try:
            with open(support_file_path, 'r') as file:
                support_data = json.load(file)
        except FileNotFoundError:
            dispatcher.utter_message(text="Sorry, I couldn't find the file containing the support data.")
            return []

        try:
            with open(announcements_file_path, 'r') as file:
                announcements_data = json.load(file)
        except FileNotFoundError:
            dispatcher.utter_message(text="Sorry, I couldn't find the file containing the announcements.")
            return []

        user_input = self.normalize(tracker.latest_message['text'])

        # Check if the user is asking about announcements specifically
        if 'announcement' in user_input:
            self.handle_announcements(announcements_data, dispatcher)
            return []

        matched_topics = []

        for item in support_data:
            title = self.normalize(item.get('Topic Title', ''))
            similarity_score = self.similar(user_input, title)
            if similarity_score > 0.4:  # Adjusted similarity threshold
                matched_topics.append(item)

        if matched_topics:
            dispatcher.utter_message(text="Here are some matching topics:")
            for topic in matched_topics:
                title = topic.get('Topic Title', '')
                topic_url = topic.get('Topic URL', '#')
                dispatcher.utter_message(text=f"Title: {title}\nTopic URL: {topic_url}")

                if 'solution' in user_input:
                    solution = topic.get('Solution', 'No solution provided.')
                    dispatcher.utter_message(text=f"Solution: {solution}")
        else:
            dispatcher.utter_message(text=random.choice([
                "Hmm, I couldn't find any information matching that. Would you like to try a different query?",
                "No relevant information found. What else can I assist you with?"
            ]))

        return []

    def handle_announcements(self, announcements_data, dispatcher):
        if announcements_data:
            dispatcher.utter_message(text="Here are the latest announcements:")
            for idx, announcement in enumerate(announcements_data[:2], start=1):
                title = announcement.get('Topic Title', '')
                link = announcement.get('Topic Link', '#')
                dispatcher.utter_message(text=f"{idx}. Title: {title}\nLink: {link}")
        else:
            dispatcher.utter_message(text="No announcements found.")