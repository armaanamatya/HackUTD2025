from crewai_tools import FileReadTool, DirectoryReadTool


class CustomTools:
    @staticmethod
    def get_file_tools():
        return [
            FileReadTool(),
            DirectoryReadTool(),
        ]
    
    @staticmethod
    def get_web_tools():
        return []
    
    @staticmethod
    def get_all_tools():
        return CustomTools.get_file_tools()