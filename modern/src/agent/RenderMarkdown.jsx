import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { memo } from "react";
import "./styles/AgentResponse.css";

const components = {
  ul: memo(({ node, ...props }) => {
    return (
      <div>
        <ul
          style={{ marginLeft: "8px", listStyleType: "disc", marginTop: "5px" }}
          {...props}
        ></ul>
        {node.children.map((ele, index) => {
          if (
            ele.type === "element" &&
            ele.tagName === "li" &&
            ele.children?.[0]
          ) {
            const deviceText = ele.children[0].value;

            if (deviceText && deviceText.includes("Device ID")) {
              const deviceMatch = deviceText.match(
                /Device ID:\s*(\d+),\s*Name:\s*([^,]+)/
              );

              if (deviceMatch) {
                const [, deviceId, deviceName] = deviceMatch;
                return (
                  <div
                    className="device-card"
                    key={index}
                    style={{
                      background: "#ffffff",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "20px",
                      boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.1)",
                      width: "300px",
                      display: "inline-block",
                      marginRight: "20px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: "15px",
                        marginBottom: "8px",
                      }}
                    >
                      Device ID: {deviceId}
                    </div>
                    <div
                      style={{
                        color: "#111827",
                        fontSize: "18px",
                        fontWeight: "600",
                      }}
                    >
                      {deviceName.trim()}
                    </div>
                  </div>
                );
              }
            }
          }
          return null;
        })}
      </div>
    );
  }),
  ol: memo(({ node, ...props }) => {
    return (
      <div>
        <ol
          style={{
            marginLeft: "8px",
            listStyleType: "decimal",
            marginTop: "5px",
          }}
          {...props}
        ></ol>
        {node.children.map((ele, index) => {
          if (
            ele.type === "element" &&
            ele.tagName === "li" &&
            ele.children?.[0]
          ) {
            const deviceText = ele.children[0].value;

            if (deviceText && deviceText.includes("Device ID")) {
              const deviceMatch = deviceText.match(
                /Device ID:\s*(\d+),\s*Name:\s*([^,]+)/
              );

              if (deviceMatch) {
                const [, deviceId, deviceName] = deviceMatch;
                return (
                  <div
                    className="device-card"
                    key={index}
                    style={{
                      background: "#ffffff",
                      borderRadius: "8px",
                      padding: "20px",
                      marginBottom: "20px",
                      boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.1)",
                      width: "300px",
                      display: "inline-block",
                      marginRight: "20px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        color: "#6B7280",
                        fontSize: "15px",
                        marginBottom: "8px",
                      }}
                    >
                      Device ID: {deviceId}
                    </div>
                    <div
                      style={{
                        color: "#111827",
                        fontSize: "18px",
                        fontWeight: "600",
                      }}
                    >
                      {deviceName.trim()}
                    </div>
                  </div>
                );
              }
            }
          }
          return null;
        })}
      </div>
    );
  }),
  table: memo(({ node, ...props }) => {
    return (
      <div style={{ maxWidth: "700px", overflowX: "auto" }}>
        <table className="ml-9 my-5" {...props}></table>
      </div>
    );
  }),
};

export default function RenderMarkdown({ content }) {
  return (
    <div className="message-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
